"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
    className?: string;
    size?: "sm" | "default" | "lg";
    variant?: "default" | "ghost" | "outline";
}

export function ThemeToggle({
    className,
    size = "default",
    variant = "ghost",
}: ThemeToggleProps) {
    const { theme, setTheme, resolvedTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={variant}
                    size={size === "sm" ? "sm" : "icon"}
                    className={cn("relative", className)}
                    aria-label="Toggle theme"
                >
                    <Sun
                        className={cn(
                            "h-4 w-4 nnn-theme-icon",
                            resolvedTheme === "dark"
                                ? "nnn-theme-icon--absolute rotate-90 scale-0 opacity-0"
                                : "nnn-theme-icon--relative rotate-0 scale-100 opacity-100",
                        )}
                    />
                    <Moon
                        className={cn(
                            "h-4 w-4 nnn-theme-icon",
                            resolvedTheme === "dark"
                                ? "nnn-theme-icon--relative rotate-0 scale-100 opacity-100"
                                : "nnn-theme-icon--absolute -rotate-90 scale-0 opacity-0",
                        )}
                    />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className={cn("gap-2", theme === "light" && "text-primary")}
                >
                    <Sun className="h-4 w-4" />
                    Light
                    {theme === "light" && (
                        <Check className="ml-auto h-3 w-3 text-primary" />
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className={cn("gap-2", theme === "dark" && "text-primary")}
                >
                    <Moon className="h-4 w-4" />
                    Dark
                    {theme === "dark" && (
                        <Check className="ml-auto h-3 w-3 text-primary" />
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className={cn(
                        "gap-2",
                        theme === "system" && "text-primary",
                    )}
                >
                    <Monitor className="h-4 w-4" />
                    System
                    {theme === "system" && (
                        <Check className="ml-auto h-3 w-3 text-primary" />
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
