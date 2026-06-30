"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const colors = {
    success: "border-nnn-success text-nnn-success",
    error: "border-nnn-danger text-nnn-danger",
    warning: "border-nnn-warning text-nnn-warning",
    info: "border-border text-foreground",
};

export function ToastContainer() {
    const { toasts, removeToast } = useUIStore();

    return (
        <div
            className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
            aria-live="polite"
            aria-label="Notifications"
        >
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => {
                    const Icon = icons[toast.type];
                    return (
                        <motion.div
                            key={toast.id}
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, x: 20 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className={cn(
                                "pointer-events-auto flex items-start gap-3 rounded-lg border bg-card p-4 shadow-lg max-w-sm",
                                colors[toast.type],
                            )}
                            role="alert"
                        >
                            <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">
                                    {toast.title}
                                </p>
                                {toast.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {toast.description}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Dismiss"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
