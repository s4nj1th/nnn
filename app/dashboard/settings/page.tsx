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

const ACCENT_COLORS: { value: AccentColor; label: string; hex: string }[] = [
    { value: "yellow", label: "Yellow", hex: "#FFD60A" },
    { value: "blue", label: "Blue", hex: "#3B82F6" },
    { value: "purple", label: "Purple", hex: "#8B5CF6" },
    { value: "green", label: "Green", hex: "#22C55E" },
    { value: "orange", label: "Orange", hex: "#F97316" },
];

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
    const { addToast } = useUIStore();
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

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            // Local only profile saving is not fully supported without a local profile store mechanism, 
            // but we can just pretend to save or update the store.
            useAuthStore.setState((state) => ({
                profile: state.profile ? { ...state.profile, username } : null
            }));
            addToast({ type: "success", title: "Profile saved locally" });
        } catch {
            addToast({ type: "error", title: "Failed to save profile" });
        } finally {
            setIsSaving(false);
        }
    };

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
                    {/* Profile */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <CardTitle>Profile</CardTitle>
                            </div>
                            <CardDescription>
                                Update your display name and email
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                label="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="your_username"
                            />
                            <Input
                                label="Email"
                                value={user?.email ?? ""}
                                disabled
                                hint="Email cannot be changed"
                            />
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleSaveProfile}
                                isLoading={isSaving}
                                className="gap-2"
                            >
                                {!isSaving && <Save className="h-4 w-4" />}
                                Save Profile
                            </Button>
                        </CardContent>
                    </Card>

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

                            {/* Accent color */}
                            <div>
                                <label className="text-sm font-medium text-foreground block mb-3">
                                    Accent Color
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {ACCENT_COLORS.map(
                                        ({ value, label, hex }) => (
                                            <button
                                                key={value}
                                                onClick={() =>
                                                    updateSetting({
                                                        accentColor: value,
                                                    })
                                                }
                                                title={label}
                                                aria-label={`Set accent color to ${label}`}
                                                className={cn(
                                                    "w-8 h-8 rounded-full border-2 transition-all duration-150 nnn-accent-button",
                                                    `nnn-accent-${value}`,
                                                    settings?.accentColor ===
                                                        value
                                                        ? "border-foreground scale-110"
                                                        : "border-transparent hover:scale-105",
                                                )}
                                            />
                                        ),
                                    )}
                                </div>
                            </div>
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
