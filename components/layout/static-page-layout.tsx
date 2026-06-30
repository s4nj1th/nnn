"use client";

import type { ReactNode } from "react";
import { Brain } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { BackButton } from "@/components/ui/back-button";
import { cn } from "@/lib/utils";
interface StaticPageLayoutProps {
    title: string;
    backHref?: string;
    backLabel?: string;
    updated?: string;
    wide?: boolean;
    headerAction?: ReactNode;
    children: ReactNode;
}

export function StaticPageLayout({
    title,
    backHref = "/",
    backLabel = "Back",
    updated,
    wide,
    headerAction,
    children,
}: StaticPageLayoutProps) {
    return (
        <div className="nnn-static-page">
            <header className="nnn-static-header">
                <div className="nnn-static-header-inner">
                    <div className="nnn-static-header-left">
                        <BackButton href={backHref} label={backLabel} />
                        <div className="nnn-static-header-title">
                            <Brain className="h-4 w-4 text-primary" />
                            <span>{title}</span>
                        </div>
                    </div>
                    <div className="nnn-static-header-actions">
                        <ThemeToggle />
                        {headerAction ?? (
                            <Link href="/signup">
                                <Button variant="accent" size="sm">
                                    Get Started
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main
                className={cn(
                    "nnn-static-main",
                    wide && "nnn-static-main-wide",
                )}
            >
                <h1 className="nnn-static-title">{title}</h1>
                {updated && (
                    <p className="nnn-static-updated">
                        Last updated: {updated}
                    </p>
                )}
                <div className="nnn-static-prose">{children}</div>
            </main>
        </div>
    );
}
