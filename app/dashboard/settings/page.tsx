"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Save, User, Palette, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import type { AccentColor, Theme } from "@/types";

const THEME_OPTIONS: {
    value: Theme;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
];

export default function SettingsPage() {
    const { user, profile, settings, setSettings } = useAuthStore();
    const { theme, setTheme } = useTheme();
    const [isSaving, setIsSaving] = useState(false);
    const [username, setUsername] = useState(profile?.username ?? "");

    const updateSetting = useCallback(
        async (updates: Partial<typeof settings>) => {
            if (!settings) return;
            const merged = { ...settings, ...updates };
            setSettings(merged);
        },
        [settings, setSettings],
    );

    const handleThemeChange = useCallback(
        async (newTheme: Theme) => {
            setTheme(newTheme);
        },
        [setTheme],
    );

    return (
        <div className="p-6 md:p-8 max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-foreground mb-1">
                    Settings
                </h1>
                <p className="text-sm text-muted-foreground mb-8">
                    Manage your account and preferences
                </p>

                <div className="space-y-6">
                    {/* Appearance */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Palette className="h-4 w-4 text-muted-foreground" />
                                <CardTitle>Appearance</CardTitle>
                            </div>
                            <CardDescription>
                                Customize the look and feel
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Theme */}
                            <div>
                                <label className="text-sm font-medium text-foreground block mb-3">
                                    Theme
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {THEME_OPTIONS.map(
                                        ({ value, label, icon: Icon }) => (
                                            <button
                                                key={value}
                                                onClick={() =>
                                                    handleThemeChange(value)
                                                }
                                                className={cn(
                                                    "flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm transition-all duration-150",
                                                    theme === value
                                                        ? "border-primary bg-primary/10 text-primary font-medium"
                                                        : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-border/80",
                                                )}
                                            >
                                                <Icon className="h-4 w-4" />
                                                {label}
                                            </button>
                                        ),
                                    )}
                                </div>
                            </div>

                            <Separator />
                        </CardContent>
                    </Card>

                    {/* Canvas preferences */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Sliders className="h-4 w-4 text-muted-foreground" />
                                <CardTitle>Canvas</CardTitle>
                            </div>
                            <CardDescription>
                                Configure the editor behaviour
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                {
                                    label: "Show grid",
                                    description:
                                        "Display a dot grid on the canvas",
                                    key: "gridVisible" as const,
                                },
                                {
                                    label: "Animations",
                                    description:
                                        "Enable node and transition animations",
                                    key: "animationsEnabled" as const,
                                },
                            ].map(({ label, description, key }) => (
                                <div
                                    key={key}
                                    className="flex items-center justify-between py-1"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {description}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings?.[key] ?? true}
                                        onCheckedChange={(v) =>
                                            updateSetting({ [key]: v })
                                        }
                                        aria-label={label}
                                    />
                                </div>
                            ))}

                            <Separator />

                            {/* Grid density */}
                            <div>
                                <label className="text-sm font-medium text-foreground block mb-2">
                                    Grid density
                                </label>
                                <div className="flex gap-2">
                                    {(
                                        ["sparse", "normal", "dense"] as const
                                    ).map((d) => (
                                        <button
                                            key={d}
                                            onClick={() =>
                                                updateSetting({
                                                    gridDensity: d,
                                                })
                                            }
                                            className={cn(
                                                "flex-1 py-1.5 rounded-md text-xs border transition-all",
                                                settings?.gridDensity === d
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-border text-muted-foreground hover:text-foreground",
                                            )}
                                        >
                                            {d.charAt(0).toUpperCase() +
                                                d.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
}
