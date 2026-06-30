"use client";

import { useEffect, useState, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CanvasEditor } from "@/components/canvas/canvas-editor";
import { ShortcutsModal } from "@/components/canvas/shortcuts-modal";
import { ExportModal } from "@/components/canvas/export-modal";
import { useCanvasStore } from "@/store/canvas-store";
import { useProjectStore } from "@/store/project-store";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { generateAndStoreThumbnail } from "@/lib/thumbnail";
import type { CanvasState } from "@/types";

const PENDING_TEMPLATE_KEY = "nnn.pending-example-template";

const DEFAULT_CANVAS: CanvasState = {
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    settings: {
        gridVisible: true,
        snapToGrid: false,
        gridSize: 24,
        showMinimap: true,
        showControls: true,
        animationsEnabled: true,
    },
    simulation: {
        inputValues: {},
        stepMode: false,
        autoRun: false,
        speed: 1,
        currentStep: 0,
    },
    layers: [],
};

interface EditorPageProps {
    params: Promise<{ id: string }>;
}

export default function EditorPage({ params }: EditorPageProps) {
    const { id: projectId } = use(params);
    const router = useRouter();
    const { user } = useAuthStore();
    const {
        loadCanvasState,
        markSaved,
        isDirty,
        nodes,
        edges,
        viewport,
        settings,
        layers,
    } = useCanvasStore();
    const addProject = useProjectStore((s) => s.addProject);
    const updateProject = useProjectStore((s) => s.updateProject);
    const setCurrentProject = useProjectStore((s) => s.setCurrentProject);
    const currentProject = useProjectStore((s) => s.currentProject);
    const { addToast } = useUIStore();
    const creationPromiseRef = useRef<Promise<boolean> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [projectTitle, setProjectTitle] = useState("Untitled Project");

    const isNewProject = projectId === "new";

    // Load or create project
    const hasInitialized = useRef(false);
    useEffect(() => {
        if (!user) {
            return;
        }

        let cancelled = false;

        const load = async () => {
            if (isNewProject) {
                if (hasInitialized.current) return;
                hasInitialized.current = true;
                let pendingTemplate: {
                    title?: string;
                    description?: string;
                    thumbnail?: string;
                    canvasState?: CanvasState;
                } | null = null;

                try {
                    const rawTemplate =
                        sessionStorage.getItem(PENDING_TEMPLATE_KEY);
                    pendingTemplate = rawTemplate
                        ? JSON.parse(rawTemplate)
                        : null;
                    // Don't remove it here or below, otherwise StrictMode second pass will get null
                    // and create a blank project. We'll let it stay. It will just be overwritten next time.
                } catch {
                    pendingTemplate = null;
                }

                const initialCanvas =
                    pendingTemplate?.canvasState ?? DEFAULT_CANVAS;
                const initialTitle =
                    pendingTemplate?.title ?? "Untitled Project";
                const draftProjectId = crypto.randomUUID();

                setProjectTitle(initialTitle);
                
                const newProject = {
                    id: draftProjectId,
                    userId: user.id,
                    title: initialTitle,
                    description: pendingTemplate?.description,
                    thumbnail: pendingTemplate?.thumbnail,
                    isPublic: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                setCurrentProject(newProject);
                loadCanvasState(initialCanvas);
                setIsLoading(false);

                creationPromiseRef.current = (async () => {
                    addProject(newProject);

                    try {
                        localStorage.setItem(`nnn.canvas_state.${draftProjectId}`, JSON.stringify(initialCanvas));
                    } catch (e) {
                        console.error("Failed to save canvas state to localStorage", e);
                    }

                    if (!cancelled) {
                        router.replace(`/editor/${draftProjectId}`);
                    }

                    // Removed sessionStorage cleanup here to prevent StrictMode bugs.
                    // It's safe to leave PENDING_TEMPLATE_KEY since it's only read when explicitly navigating to /editor/new.

                    return true;
                })();
            } else {
                // Load existing project
                const project = useProjectStore.getState().projects.find(p => p.id === projectId);

                if (!project) {
                    addToast({ type: "error", title: "Project not found" });
                    router.push("/dashboard");
                    return;
                }

                setProjectTitle(project.title);
                setCurrentProject(project);

                let canvasState = DEFAULT_CANVAS;
                try {
                    const canvasDataStr = localStorage.getItem(`nnn.canvas_state.${projectId}`);
                    if (canvasDataStr) {
                        canvasState = JSON.parse(canvasDataStr);
                    }
                } catch (e) {
                    console.error("Failed to parse canvas state from localStorage", e);
                }

                loadCanvasState(canvasState);
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, [
        projectId,
        user,
        isNewProject,
        router,
        loadCanvasState,
        setCurrentProject,
        addToast,
    ]);

    const handleSave = useCallback(async () => {
        if (!currentProject || isSaving) return;
        setIsSaving(true);
        try {
            if (creationPromiseRef.current) {
                const created = await creationPromiseRef.current;
                creationPromiseRef.current = null;
                if (!created) return;
            }

            const canvasState: CanvasState = {
                nodes,
                edges,
                viewport,
                settings,
                simulation: DEFAULT_CANVAS.simulation,
                layers,
            };

            try {
                localStorage.setItem(`nnn.canvas_state.${currentProject.id}`, JSON.stringify(canvasState));
            } catch (e) {
                throw new Error("Failed to save canvas state to localStorage");
            }

            // Generate and store thumbnails for both light and dark modes (non-blocking)
            generateAndStoreThumbnail(currentProject.id, nodes, edges, true).catch(() => {});
            generateAndStoreThumbnail(currentProject.id, nodes, edges, false).catch(() => {});

            // Update project timestamp
            updateProject(currentProject.id, { updatedAt: new Date().toISOString() });

            markSaved();
            addToast({ type: "success", title: "Saved", duration: 1500 });
        } catch {
            addToast({
                type: "error",
                title: "Save failed. Please try again.",
            });
        } finally {
            setIsSaving(false);
        }
    }, [
        currentProject,
        isSaving,
        nodes,
        edges,
        viewport,
        settings,
        layers,
        markSaved,
        addToast,
        updateProject,
    ]);

    // Autosave every 30s when dirty
    useEffect(() => {
        if (!isDirty || isNewProject) return;
        const timer = setTimeout(() => {
            void handleSave();
        }, 30_000);
        return () => clearTimeout(timer);
    }, [isDirty, isNewProject, handleSave]);

    // Capture thumbnail on tab close / browser unload
    useEffect(() => {
        if (!currentProject) return;
        const id = currentProject.id;
        const captureOnUnload = () => {
            // capture exactly what we have right now in local state for both modes
            generateAndStoreThumbnail(id, nodes, edges, true).catch(() => {});
            generateAndStoreThumbnail(id, nodes, edges, false).catch(() => {});
        };
        window.addEventListener('beforeunload', captureOnUnload);
        // Also capture when React unmounts (navigation away inside the SPA)
        return () => {
            window.removeEventListener('beforeunload', captureOnUnload);
            // Fire and forget on unmount for both modes
            generateAndStoreThumbnail(id, nodes, edges, true).catch(() => {});
            generateAndStoreThumbnail(id, nodes, edges, false).catch(() => {});
        };
    }, [currentProject, nodes, edges]);

    const handleRename = useCallback((newTitle: string) => {
        setProjectTitle(newTitle);
        if (currentProject) {
            updateProject(currentProject.id, { title: newTitle, updatedAt: new Date().toISOString() });
        }
    }, [currentProject, updateProject]);

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Loading canvas…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen overflow-hidden">
            <CanvasEditor
                projectId={currentProject?.id ?? "new"}
                projectTitle={projectTitle}
                onSave={handleSave}
                onRename={handleRename}
                isSaving={isSaving}
            />
            <ShortcutsModal />
            <ExportModal />
        </div>
    );
}
