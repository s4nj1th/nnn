"use client";

import { useState, useCallback } from "react";
import { Download, FileJson, FileImage, Code2, Check } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUIStore } from "@/store/ui-store";
import { useCanvasStore } from "@/store/canvas-store";
import { useProjectStore } from "@/store/project-store";
import { useUIStore as useUI } from "@/store/ui-store";

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function sanitizeFilename(title: string) {
    return title.replace(/[^a-z0-9_\-]/gi, "_").toLowerCase() || "project";
}

export function ExportModal() {
    const { isExportModalOpen, setExportModal } = useUIStore();
    const { nodes, edges, viewport, settings, layers } = useCanvasStore();
    const { currentProject } = useProjectStore();
    const { addToast } = useUI();
    const [exportingId, setExportingId] = useState<string | null>(null);
    const [doneId, setDoneId] = useState<string | null>(null);

    const projectName = sanitizeFilename(currentProject?.title ?? "project");

    const markDone = (id: string) => {
        setDoneId(id);
        setTimeout(() => setDoneId(null), 1800);
    };

    const exportJSON = useCallback(async () => {
        setExportingId("json");
        try {
            const data = {
                version: 1,
                project: {
                    title: currentProject?.title,
                    exportedAt: new Date().toISOString(),
                },
                canvas: { nodes, edges, viewport, settings, layers },
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
            });
            downloadBlob(blob, `${projectName}.json`);
            markDone("json");
            addToast({
                type: "success",
                title: "Exported as JSON",
                duration: 2000,
            });
        } catch {
            addToast({ type: "error", title: "Export failed" });
        } finally {
            setExportingId(null);
        }
    }, [
        nodes,
        edges,
        viewport,
        settings,
        layers,
        currentProject,
        projectName,
        addToast,
    ]);

    const exportSVG = useCallback(async () => {
        setExportingId("svg");
        try {
            // Build a simple SVG representation of the network
            const padding = 60;
            const nodeW = 40;
            const nodeH = 40;

            // Compute bounding box
            const xs = nodes.map((n) => n.position.x);
            const ys = nodes.map((n) => n.position.y);
            const minX = Math.min(...xs, 0) - padding;
            const minY = Math.min(...ys, 0) - padding;
            const maxX = Math.max(...xs, 0) + nodeW + padding;
            const maxY = Math.max(...ys, 0) + nodeH + padding;
            const W = maxX - minX;
            const H = maxY - minY;

            const nodeColorMap: Record<string, string> = {
                input: "#3b82f6",
                hidden: "#eab308",
                output: "#22c55e",
            };

            const edgeSVG = edges
                .map((e) => {
                    const src = nodes.find((n) => n.id === e.source);
                    const tgt = nodes.find((n) => n.id === e.target);
                    if (!src || !tgt) return "";
                    const x1 = src.position.x - minX + nodeW / 2;
                    const y1 = src.position.y - minY + nodeH / 2;
                    const x2 = tgt.position.x - minX + nodeW / 2;
                    const y2 = tgt.position.y - minY + nodeH / 2;
                    const w = e.data?.weight ?? 0;
                    const stroke = w >= 0 ? "#eab308" : "#ef4444";
                    const sw = Math.max(0.5, Math.min(3, Math.abs(w) * 1.5));
                    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="0.6"/>`;
                })
                .join("\n");

            const nodeSVG = nodes
                .map((n) => {
                    const x = n.position.x - minX;
                    const y = n.position.y - minY;
                    const color = nodeColorMap[n.data.neuronType] ?? "#888";
                    return `
  <rect x="${x}" y="${y}" width="${nodeW}" height="${nodeH}" rx="8" fill="${color}" fill-opacity="0.15" stroke="${color}" stroke-width="1.5"/>
  <text x="${x + nodeW / 2}" y="${y + nodeH / 2 + 1}" text-anchor="middle" dominant-baseline="middle" font-size="11" font-family="system-ui,sans-serif" fill="${color}" font-weight="600">${n.data.label}</text>
  <text x="${x + nodeW / 2}" y="${y + nodeH - 6}" text-anchor="middle" font-size="8" font-family="system-ui,sans-serif" fill="${color}" opacity="0.7">${n.data.activationFunction}</text>`;
                })
                .join("\n");

            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  ${edgeSVG}
  ${nodeSVG}
  <text x="${W / 2}" y="${H - 10}" text-anchor="middle" font-size="10" fill="#555" font-family="system-ui,sans-serif">${currentProject?.title ?? "Neural Network"}</text>
</svg>`;

            const blob = new Blob([svg], { type: "image/svg+xml" });
            downloadBlob(blob, `${projectName}.svg`);
            markDone("svg");
            addToast({
                type: "success",
                title: "Exported as SVG",
                duration: 2000,
            });
        } catch {
            addToast({ type: "error", title: "Export failed" });
        } finally {
            setExportingId(null);
        }
    }, [nodes, edges, currentProject, projectName, addToast]);

    const exportPNG = useCallback(async () => {
        setExportingId("png");
        try {
            const padding = 60;
            const nodeW = 80;
            const nodeH = 40;
            const scale = 2; // Retina

            const xs = nodes.map((n) => n.position.x);
            const ys = nodes.map((n) => n.position.y);
            const minX = Math.min(...xs, 0) - padding;
            const minY = Math.min(...ys, 0) - padding;
            const maxX = Math.max(...xs, 0) + nodeW + padding;
            const maxY = Math.max(...ys, 0) + nodeH + padding;
            const W = maxX - minX;
            const H = maxY - minY;

            const canvas = document.createElement("canvas");
            canvas.width = W * scale;
            canvas.height = H * scale;
            const ctx = canvas.getContext("2d")!;
            ctx.scale(scale, scale);

            // Background
            ctx.fillStyle = "#0a0a0a";
            ctx.fillRect(0, 0, W, H);

            const nodeColorMap: Record<string, string> = {
                input: "#3b82f6",
                hidden: "#eab308",
                output: "#22c55e",
            };

            // Draw edges
            edges.forEach((e) => {
                const src = nodes.find((n) => n.id === e.source);
                const tgt = nodes.find((n) => n.id === e.target);
                if (!src || !tgt) return;
                const x1 = src.position.x - minX + nodeW / 2;
                const y1 = src.position.y - minY + nodeH / 2;
                const x2 = tgt.position.x - minX + nodeW / 2;
                const y2 = tgt.position.y - minY + nodeH / 2;
                const w = e.data?.weight ?? 0;
                ctx.strokeStyle =
                    w >= 0 ? "rgba(234,179,8,0.5)" : "rgba(239,68,68,0.5)";
                ctx.lineWidth = Math.max(0.5, Math.min(3, Math.abs(w) * 1.5));
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            });

            // Draw nodes
            nodes.forEach((n) => {
                const x = n.position.x - minX;
                const y = n.position.y - minY;
                const color = nodeColorMap[n.data.neuronType] ?? "#888";

                // Box
                ctx.fillStyle = color + "26"; // 15% opacity
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(x, y, nodeW, nodeH, 8);
                ctx.fill();
                ctx.stroke();

                // Label
                ctx.fillStyle = color;
                ctx.font = "600 11px system-ui, sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(n.data.label, x + nodeW / 2, y + nodeH / 2 - 3);

                // Activation
                ctx.font = "8px system-ui, sans-serif";
                ctx.globalAlpha = 0.7;
                ctx.fillText(
                    n.data.activationFunction,
                    x + nodeW / 2,
                    y + nodeH - 7,
                );
                ctx.globalAlpha = 1;
            });

            // Title
            ctx.fillStyle = "#555";
            ctx.font = "10px system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "alphabetic";
            ctx.fillText(
                currentProject?.title ?? "Neural Network",
                W / 2,
                H - 8,
            );

            canvas.toBlob((blob) => {
                if (!blob) {
                    addToast({ type: "error", title: "PNG export failed" });
                    return;
                }
                downloadBlob(blob, `${projectName}.png`);
                markDone("png");
                addToast({
                    type: "success",
                    title: "Exported as PNG",
                    duration: 2000,
                });
                setExportingId(null);
            }, "image/png");
        } catch {
            addToast({ type: "error", title: "Export failed" });
            setExportingId(null);
        }
    }, [nodes, edges, currentProject, projectName, addToast]);

    const formats = [
        {
            id: "json",
            icon: FileJson,
            label: "JSON",
            description:
                "Full canvas state — re-importable, includes all weights and settings",
            action: exportJSON,
        },
        {
            id: "svg",
            icon: Code2,
            label: "SVG",
            description:
                "Vector graphic — sharp at any size, opens in any browser or editor",
            action: exportSVG,
        },
        {
            id: "png",
            icon: FileImage,
            label: "PNG",
            description:
                "2× retina raster image — great for docs, slides, or sharing",
            action: exportPNG,
        },
    ];

    return (
        <Dialog open={isExportModalOpen} onOpenChange={setExportModal}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </DialogTitle>
                    <DialogDescription>
                        Download your neural network as a file.
                    </DialogDescription>
                </DialogHeader>
                <Separator />
                <div className="space-y-2 pt-1">
                    {formats.map(
                        ({ id, icon: Icon, label, description, action }) => {
                            const isLoading = exportingId === id;
                            const isDone = doneId === id;
                            return (
                                <button
                                    key={id}
                                    onClick={action}
                                    disabled={!!exportingId}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-secondary transition-all duration-150 text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                                        {isDone ? (
                                            <Check className="h-4 w-4 text-primary" />
                                        ) : (
                                            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">
                                            {label}
                                        </p>
                                        <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                                            {description}
                                        </p>
                                    </div>
                                    {isLoading && (
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                    )}
                                </button>
                            );
                        },
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
