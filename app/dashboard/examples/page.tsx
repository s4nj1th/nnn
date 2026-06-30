"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Network, Brain, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { EXAMPLE_TEMPLATES } from "@/lib/templates";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import type { ExampleTemplate } from "@/types";
import { cn } from "@/lib/utils";

const PENDING_TEMPLATE_KEY = "nnn.pending-example-template";

const difficultyColors = {
    beginner: "success" as const,
    intermediate: "warning" as const,
    advanced: "accent" as const,
};

function ExampleGallery() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuthStore();
    const { addToast } = useUIStore();
    const [openingId, setOpeningId] = useState<string | null>(null);
    const [filter, setFilter] = useState<
        "all" | "beginner" | "intermediate" | "advanced"
    >("all");

    const highlighted = searchParams.get("template");

    const filtered =
        filter === "all"
            ? EXAMPLE_TEMPLATES
            : EXAMPLE_TEMPLATES.filter((t) => t.difficulty === filter);

    const handleOpen = async (template: ExampleTemplate) => {
        setOpeningId(template.id);
        try {
            sessionStorage.setItem(
                PENDING_TEMPLATE_KEY,
                JSON.stringify({
                    title: template.title,
                    description: template.description,
                    thumbnail: template.thumbnail,
                    canvasState: template.canvasState,
                }),
            );

            if (user) {
                addToast({
                    type: "success",
                    title: "Template loading…",
                    duration: 1200,
                });
            }

            router.push("/editor/new");
        } catch {
            addToast({ type: "error", title: "Failed to open template" });
        } finally {
            setOpeningId(null);
        }
    };

    return (
        <div className="nnn-static-page">
            <main className="mx-auto max-w-7xl px-6 py-12">
                {/* Page header */}
                <div className="mb-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                            Example Networks
                        </h1>
                        <p className="text-muted-foreground max-w-lg mx-auto">
                            Start from a working example. Open any template to
                            load it into the canvas editor.
                        </p>
                    </motion.div>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 mb-8 justify-center flex-wrap">
                    {(
                        ["all", "beginner", "intermediate", "advanced"] as const
                    ).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150",
                                filter === f
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80",
                            )}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            {f !== "all" && (
                                <span className="ml-1.5 opacity-60">
                                    (
                                    {
                                        EXAMPLE_TEMPLATES.filter(
                                            (t) => t.difficulty === f,
                                        ).length
                                    }
                                    )
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Templates grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((template, i) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.06 }}
                        >
                            <Card
                                className={cn(
                                    "overflow-hidden transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
                                    highlighted === template.id &&
                                        "border-primary shadow-lg shadow-primary/10",
                                )}
                            >
                                {/* Preview */}
                                <div className="relative h-40 border-b border-border overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Network className="w-20 h-20 text-primary/15" />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />

                                    {/* Node count indicator */}
                                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                                        <span className="text-[10px] bg-background/80 backdrop-blur-sm border border-border rounded px-1.5 py-0.5 text-muted-foreground">
                                            {template.canvasState.nodes.length}{" "}
                                            nodes
                                        </span>
                                        <span className="text-[10px] bg-background/80 backdrop-blur-sm border border-border rounded px-1.5 py-0.5 text-muted-foreground">
                                            {template.canvasState.edges.length}{" "}
                                            edges
                                        </span>
                                    </div>

                                    <Badge
                                        variant={
                                            difficultyColors[
                                                template.difficulty
                                            ]
                                        }
                                        className="absolute top-3 right-3"
                                    >
                                        {template.difficulty}
                                    </Badge>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="text-sm font-semibold text-foreground mb-1.5">
                                        {template.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                                        {template.description}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {template.tags
                                            .slice(0, 3)
                                            .map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full gap-2 group"
                                        onClick={() => handleOpen(template)}
                                        isLoading={openingId === template.id}
                                        disabled={!!openingId}
                                    >
                                        {openingId !== template.id && (
                                            <>
                                                <Play className="h-3.5 w-3.5" />
                                                Open Example
                                                <ChevronRight className="ml-auto h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* CTA for non-auth */}
                {!user && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-16 text-center rounded-2xl border border-primary/20 bg-primary/5 p-10"
                    >
                        <h2 className="text-xl font-bold text-foreground mb-3">
                            Save your work & create custom networks
                        </h2>
                        <p className="text-muted-foreground mb-6 text-sm max-w-sm mx-auto">
                            Sign up free to save projects, export your
                            architectures, and share with others.
                        </p>
                        <Link href="/signup">
                            <Button variant="accent" className="gap-2">
                                Create Free Account
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </motion.div>
                )}
            </main>
        </div>
    );
}

export default function ExamplesPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-muted-foreground text-sm">
                        Loading examples…
                    </div>
                </div>
            }
        >
            <ExampleGallery />
        </Suspense>
    );
}
