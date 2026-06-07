"use client";

import { useEffect, useState, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CanvasEditor } from "@/components/canvas/canvas-editor";
import { ShortcutsModal } from "@/components/canvas/shortcuts-modal";
import { useCanvasStore } from "@/store/canvas-store";
import { useProjectStore } from "@/store/project-store";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { createClient } from "@/lib/supabase/client";
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
    const { setCurrentProject, currentProject } = useProjectStore();
    const { addToast } = useUIStore();
    const creationPromiseRef = useRef<Promise<boolean> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [projectTitle, setProjectTitle] = useState("Untitled Project");

    const isNewProject = projectId === "new";

    // Load or create project
    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }

        let cancelled = false;

        const load = async () => {
            const supabase = createClient();

            if (isNewProject) {
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
                } catch {
                    pendingTemplate = null;
                }

                const initialCanvas =
                    pendingTemplate?.canvasState ?? DEFAULT_CANVAS;
                const initialTitle =
                    pendingTemplate?.title ?? "Untitled Project";
                const draftProjectId = crypto.randomUUID();

                setProjectTitle(initialTitle);
                setCurrentProject({
                    id: draftProjectId,
                    userId: user.id,
                    title: initialTitle,
                    description: pendingTemplate?.description,
                    thumbnail: pendingTemplate?.thumbnail,
                    isPublic: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
                loadCanvasState(initialCanvas);
                setIsLoading(false);

                creationPromiseRef.current = (async () => {
                    const { data: project, error } = await supabase
                        .from("projects")
                        .insert({
                            id: draftProjectId,
                            user_id: user.id,
                            title: initialTitle,
                            description: pendingTemplate?.description,
                            thumbnail: pendingTemplate?.thumbnail,
                        })
                        .select()
                        .single();

                    if (error || !project) throw error;

                    await supabase.from("project_data").insert({
                        project_id: project.id,
                        canvas_state: initialCanvas,
                    });

                    if (!cancelled) {
                        router.replace(`/editor/${project.id}`);
                    }

                    try {
                        sessionStorage.removeItem(PENDING_TEMPLATE_KEY);
                    } catch {
                        // Ignore storage cleanup errors.
                    }

                    return true;
                })().catch(() => {
                    if (!cancelled) {
                        addToast({
                            type: "error",
                            title: "Failed to create project",
                        });
                        router.push("/dashboard");
                    }
                    return false;
                });
            } else {
                // Load existing project
                const { data: project } = await supabase
                    .from("projects")
                    .select("*")
                    .eq("id", projectId)
                    .single();

                if (!project) {
                    addToast({ type: "error", title: "Project not found" });
                    router.push("/dashboard");
                    return;
                }

                const { data: canvasData } = await supabase
                    .from("project_data")
                    .select("canvas_state")
                    .eq("project_id", projectId)
                    .single();

                setProjectTitle(project.title);
                setCurrentProject({
                    id: project.id,
                    userId: project.user_id,
                    title: project.title,
                    description: project.description,
                    thumbnail: project.thumbnail,
                    isPublic: project.is_public,
                    createdAt: project.created_at,
                    updatedAt: project.updated_at,
                });

                const state = canvasData?.canvas_state ?? DEFAULT_CANVAS;
                loadCanvasState(state as CanvasState);
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

            const supabase = createClient();
            const canvasState: CanvasState = {
                nodes,
                edges,
                viewport,
                settings,
                simulation: DEFAULT_CANVAS.simulation,
                layers,
            };

            const { error } = await supabase
                .from("project_data")
                .upsert({
                    project_id: currentProject.id,
                    canvas_state: canvasState,
                });

            if (error) throw error;

            // Update project timestamp
            await supabase
                .from("projects")
                .update({ updated_at: new Date().toISOString() })
                .eq("id", currentProject.id);

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
    ]);

    // Autosave every 30s when dirty
    useEffect(() => {
        if (!isDirty || isNewProject) return;
        const timer = setTimeout(() => {
            void handleSave();
        }, 30_000);
        return () => clearTimeout(timer);
    }, [isDirty, isNewProject, handleSave]);

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
                isSaving={isSaving}
            />
            <ShortcutsModal />
        </div>
    );
}
