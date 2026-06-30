"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    LayoutDashboard,
    FolderOpen,
    BookOpen,
    Settings,
    LogOut,
    ChevronLeft,
    Plus,
    User,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/projects", icon: FolderOpen, label: "Projects" },
    { href: "/examples", icon: BookOpen, label: "Examples" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

function SidebarNav({
    collapsed,
    onCollapse,
}: {
    collapsed: boolean;
    onCollapse: (v: boolean) => void;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, profile } = useAuthStore();

    const handleReset = () => {
        if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/";
        }
    };

    const initials = profile?.username
        ? profile.username.slice(0, 2).toUpperCase()
        : (user?.email?.slice(0, 2).toUpperCase() ?? "NN");

    return (
        <aside
            className={cn(
                "flex flex-col h-full border-r border-border bg-background transition-all duration-300",
                collapsed ? "w-14" : "w-56",
            )}
            aria-label="Sidebar navigation"
        >
            {/* Logo */}
            <div
                className={`
                     flex items-center px-3 border-b border-border ${collapsed ? "flex-col h-20 justify-center gap-2" : "flex-row h-14 justify-between"}
                `}
            >
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-2 overflow-hidden"
                        >
                            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
                                <Brain className="w-3.5 h-3.5 text-primary-foreground" />
                            </div>
                            <span className="text-sm font-bold text-foreground whitespace-nowrap">
                                NNN
                            </span>
                        </motion.div>
                    )}
                    {collapsed && (
                        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center mx-auto">
                            <Brain className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                    )}
                </AnimatePresence>
                {!collapsed && (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onCollapse(true)}
                        aria-label="Collapse sidebar"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}
                {collapsed && (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="w-full"
                        onClick={() => onCollapse(false)}
                        aria-label="Expand sidebar"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="p-2">
                <Link href="/editor/new" onClick={() => sessionStorage.removeItem("nnn.pending-example-template")}>
                    <Button
                        variant="accent"
                        size={collapsed ? "icon-sm" : "sm"}
                        className={cn("w-full gap-2", collapsed && "w-9")}
                        title={collapsed ? "New Project" : undefined}
                    >
                        <Plus className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && "New Project"}
                    </Button>
                </Link>
            </div>

            {/* Nav items */}
            <nav
                className="flex-1 px-2 py-2 space-y-0.5"
                aria-label="Main navigation"
            >
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" &&
                            pathname.startsWith(item.href));
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-colors duration-150 cursor-pointer",
                                    isActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                                    collapsed && "justify-center px-2",
                                )}
                                title={collapsed ? item.label : undefined}
                            >
                                <item.icon className="h-4 w-4 flex-shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <Separator />

            {/* User section */}
            <div className="p-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className={cn(
                                "flex items-center gap-2.5 w-full rounded-lg px-2 py-2 hover:bg-secondary transition-colors",
                                collapsed && "justify-center",
                            )}
                            aria-label="User menu"
                        >
                            <Avatar className="w-7 h-7 flex-shrink-0">
                                <AvatarImage
                                    src={profile?.avatarUrl ?? undefined}
                                />
                                <AvatarFallback className="text-xs">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            {!collapsed && (
                                <div className="flex-1 text-left overflow-hidden">
                                    <p className="text-xs font-medium text-foreground truncate">
                                        {profile?.username ??
                                            user?.email?.split("@")[0]}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground truncate">
                                        {user?.email}
                                    </p>
                                </div>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        side="top"
                        className="w-48"
                    >
                        <DropdownMenuLabel className="font-normal">
                            <p className="text-xs font-medium">
                                {profile?.username ?? "My Account"}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                                {user?.email}
                            </p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link
                                href="/dashboard/settings"
                                className="gap-2 cursor-pointer"
                            >
                                <User className="h-4 w-4" /> Profile
                            </Link>
                        </DropdownMenuItem>
                        <ThemeToggle />
                        <DropdownMenuItem
                            onClick={handleReset}
                            destructive
                            className="gap-2 cursor-pointer"
                        >
                            <LogOut className="h-4 w-4" /> Clear All Data
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>
    );
}

export function DashboardClient({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <SidebarNav collapsed={collapsed} onCollapse={setCollapsed} />
            <main className="flex-1 overflow-auto" role="main">
                {children}
            </main>
        </div>
    );
}
