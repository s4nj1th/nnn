"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Plus,
    Search,
    Clock,
    ExternalLink,
    Network,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { getStoredThumbnail, removeStoredThumbnail } from "@/lib/thumbnail";
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
    const [thumbnail, setThumbnail] = useState<string | null>(null);

    useEffect(() => {
        setThumbnail(getStoredThumbnail(project.id));
    }, [project.id]);

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
                        {thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={thumbnail}
                                alt={`${project.title} thumbnail`}
                                className={styles.thumbnailImg}
                            />
                        ) : (
                            <div className={styles.thumbnailIconWrapper}>
                                <Network className={styles.thumbnailIcon} />
                            </div>
                        )}
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

                <Link href={`/editor/${project.id}`}>
                    <div className={styles.cardContent}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitleWrapper}>
                                <h3 className={styles.cardTitle}>
                                    {project.title}
                                </h3>
                            </div>
                        </div>

                        <div className={styles.cardMeta}>
                            <span className={styles.cardMetaItem}>
                                <Clock className={styles.cardMetaIcon} />
                                {formatRelativeTime(project.updatedAt)}
                            </span>
                        </div>
                    </div>
                </Link>
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
                <Link
                    href="/editor/new"
                    onClick={() =>
                        sessionStorage.removeItem(
                            "nnn.pending-example-template",
                        )
                    }
                >
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
    const [isLoading, setIsLoading] = useState(false); // Zustand loads it immediately
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Wait for Zustand rehydration if necessary, but persist usually is sync for localStorage.
    // We can just use an effect to mark as loaded.
    useEffect(() => {
        setIsLoading(false);
    }, []);

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            removeProject(deleteId);
            // Also remove canvas state from local storage
            localStorage.removeItem(`nnn.canvas_state.${deleteId}`);
            removeStoredThumbnail(deleteId);
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
            const newId = crypto.randomUUID();

            // Create duplicate project
            const newProject: Project = {
                id: newId,
                userId: user.id,
                title: `${original.title} (Copy)`,
                description: original.description,
                isPublic: false,
                thumbnail: original.thumbnail,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // Copy canvas data
            const originalDataStr = localStorage.getItem(
                `nnn.canvas_state.${id}`,
            );
            if (originalDataStr) {
                localStorage.setItem(
                    `nnn.canvas_state.${newId}`,
                    originalDataStr,
                );
            }

            addProject(newProject);
            addToast({ type: "success", title: "Project duplicated" });
            router.push(`/editor/${newProject.id}`);
        } catch {
            addToast({ type: "error", title: "Failed to duplicate project" });
        }
    };

    const filtered = getFilteredProjects();

    return (
        <div className={styles.pageContainer}>
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
                <Link
                    href="/editor/new"
                    onClick={() =>
                        sessionStorage.removeItem(
                            "nnn.pending-example-template",
                        )
                    }
                >
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
