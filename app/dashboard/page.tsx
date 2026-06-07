"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Plus,
    Search,
    Clock,
    Globe,
    Lock,
    MoreHorizontal,
    Copy,
    Trash2,
    Edit2,
    ExternalLink,
    Network,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/auth-store";
import { useProjectStore } from "@/store/project-store";
import { useUIStore } from "@/store/ui-store";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/utils";
import type { Project } from "@/types";
import styles from "./page.module.css";

// ── Project Card ─────────────────────────────────────────────
function ProjectCard({
    project,
    onDelete,
    onDuplicate,
}: {
    project: Project;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
}) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            layout
        >
            <Card className={`group ${styles.cardContainer}`}>
                {/* Thumbnail */}
                <Link
                    href={`/editor/${project.id}`}
                    className={styles.cardThumbnailLink}
                >
                    <div className={styles.cardThumbnail}>
                        <div className={styles.thumbnailIconWrapper}>
                            <Network className={styles.thumbnailIcon} />
                        </div>
                        <div className={styles.thumbnailOverlay}>
                            <div className={styles.thumbnailBadge}>
                                <ExternalLink
                                    className={styles.thumbnailBadgeIcon}
                                />
                                Open
                            </div>
                        </div>
                    </div>
                </Link>

                <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitleWrapper}>
                            <Link href={`/editor/${project.id}`}>
                                <h3 className={styles.cardTitle}>
                                    {project.title}
                                </h3>
                            </Link>
                            {project.description && (
                                <p className={styles.cardDesc}>
                                    {project.description}
                                </p>
                            )}
                        </div>

                        <DropdownMenu
                            open={menuOpen}
                            onOpenChange={setMenuOpen}
                        >
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className={styles.cardMenuBtn}
                                    aria-label="Project options"
                                >
                                    <MoreHorizontal
                                        className={styles.cardMenuBtnIcon}
                                    />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className={styles.cardMenuContent}
                            >
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/editor/${project.id}`}
                                        className={styles.cardMenuItem}
                                    >
                                        <Edit2
                                            className={styles.cardMenuItemIcon}
                                        />{" "}
                                        Open
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onDuplicate(project.id)}
                                    className={styles.cardMenuItem}
                                >
                                    <Copy className={styles.cardMenuItemIcon} />{" "}
                                    Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onDelete(project.id)}
                                    className={styles.cardMenuItemDelete}
                                >
                                    <Trash2
                                        className={styles.cardMenuItemIcon}
                                    />{" "}
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className={styles.cardMeta}>
                        <span className={styles.cardMetaItem}>
                            <Clock className={styles.cardMetaIcon} />
                            {formatRelativeTime(project.updatedAt)}
                        </span>
                        <span className={styles.cardMetaItem}>
                            {project.isPublic ? (
                                <>
                                    <Globe className={styles.cardMetaIcon} />{" "}
                                    Public
                                </>
                            ) : (
                                <>
                                    <Lock className={styles.cardMetaIcon} />{" "}
                                    Private
                                </>
                            )}
                        </span>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

// ── Empty State ───────────────────────────────────────────────
function EmptyState({ hasSearch }: { hasSearch: boolean }) {
    return (
        <div className={styles.emptyContainer}>
            <div className={styles.emptyIconWrapper}>
                <Network className={styles.emptyIcon} />
            </div>
            <h3 className={styles.emptyTitle}>
                {hasSearch ? "No projects found" : "No projects yet"}
            </h3>
            <p className={styles.emptyDesc}>
                {hasSearch
                    ? "Try a different search term."
                    : "Create your first neural network project to get started."}
            </p>
            {!hasSearch && (
                <Link href="/editor/new">
                    <Button
                        variant="accent"
                        size="sm"
                        className={styles.emptyBtn}
                    >
                        <Plus className={styles.emptyBtnIcon} />
                        Create Project
                    </Button>
                </Link>
            )}
        </div>
    );
}

// ── Dashboard Page ────────────────────────────────────────────
export default function DashboardPage() {
    const router = useRouter();
    const { user, profile } = useAuthStore();
    const {
        projects,
        setProjects,
        removeProject,
        addProject,
        searchQuery,
        setSearchQuery,
        getFilteredProjects,
    } = useProjectStore();
    const { addToast } = useUIStore();
    const [isLoading, setIsLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadProjects = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("projects")
                .select("*")
                .eq("user_id", user.id)
                .order("updated_at", { ascending: false });

            if (error) throw error;
            setProjects(
                (data ?? []).map((p) => ({
                    id: p.id,
                    userId: p.user_id,
                    title: p.title,
                    description: p.description,
                    thumbnail: p.thumbnail,
                    isPublic: p.is_public,
                    createdAt: p.created_at,
                    updatedAt: p.updated_at,
                })),
            );
        } catch {
            addToast({ type: "error", title: "Failed to load projects" });
        } finally {
            setIsLoading(false);
        }
    }, [user, setProjects, addToast]);

    useEffect(() => {
        void loadProjects();
    }, [loadProjects]);

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("projects")
                .delete()
                .eq("id", deleteId);
            if (error) throw error;
            removeProject(deleteId);
            addToast({ type: "success", title: "Project deleted" });
        } catch {
            addToast({ type: "error", title: "Failed to delete project" });
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const handleDuplicate = async (id: string) => {
        const original = projects.find((p) => p.id === id);
        if (!original || !user) return;
        try {
            const supabase = createClient();

            // Create duplicate project
            const { data: newProject, error: projError } = await supabase
                .from("projects")
                .insert({
                    user_id: user.id,
                    title: `${original.title} (Copy)`,
                    description: original.description,
                    is_public: false,
                })
                .select()
                .single();

            if (projError || !newProject) throw projError;

            // Copy canvas data
            const { data: originalData } = await supabase
                .from("project_data")
                .select("canvas_state")
                .eq("project_id", id)
                .single();

            if (originalData) {
                await supabase.from("project_data").insert({
                    project_id: newProject.id,
                    canvas_state: originalData.canvas_state,
                });
            }

            addProject({
                id: newProject.id,
                userId: newProject.user_id,
                title: newProject.title,
                description: newProject.description,
                thumbnail: newProject.thumbnail,
                isPublic: newProject.is_public,
                createdAt: newProject.created_at,
                updatedAt: newProject.updated_at,
            });
            addToast({ type: "success", title: "Project duplicated" });
            router.push(`/editor/${newProject.id}`);
        } catch {
            addToast({ type: "error", title: "Failed to duplicate project" });
        }
    };

    const filtered = getFilteredProjects();
    const greeting = profile?.username
        ? `Hey, ${profile.username}`
        : "Welcome back";

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className={styles.pageTitle}>{greeting}</h1>
                    <p className={styles.pageSubtitle}>
                        {projects.length === 0
                            ? "Create your first neural network project."
                            : `You have ${projects.length} project${projects.length !== 1 ? "s" : ""}.`}
                    </p>
                </motion.div>
            </div>

            {/* Actions bar */}
            <div className={styles.actionBar}>
                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} />
                    <input
                        type="search"
                        placeholder="Search projects…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                        aria-label="Search projects"
                    />
                </div>
                <Link href="/editor/new">
                    <Button
                        variant="accent"
                        size="sm"
                        className={styles.newBtn}
                    >
                        <Plus className={styles.newBtnIcon} />
                        New Project
                    </Button>
                </Link>
            </div>

            {/* Projects grid */}
            {isLoading ? (
                <div className={styles.loadingWrapper}>
                    <Loader2 className={styles.loadingIcon} />
                </div>
            ) : (
                <div className={styles.projectsGrid}>
                    {filtered.length === 0 ? (
                        <EmptyState hasSearch={searchQuery.length > 0} />
                    ) : (
                        filtered.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onDelete={setDeleteId}
                                onDuplicate={handleDuplicate}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Delete confirm dialog */}
            <Dialog
                open={!!deleteId}
                onOpenChange={(o) => !o && setDeleteId(null)}
            >
                <DialogContent className={styles.dialogContent}>
                    <DialogHeader>
                        <DialogTitle>Delete project?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. The project and all
                            its data will be permanently deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className={styles.dialogFooter}>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            isLoading={isDeleting}
                        >
                            {!isDeleting && "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
