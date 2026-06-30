import type { NeuronNode, ConnectionEdge } from "@/types";

const THUMB_W = 480;
const THUMB_H = 240;
const NODE_W = 72;
const NODE_H = 36;
const PADDING = 48;

const NODE_COLORS: Record<string, string> = {
    input: "#3b82f6",
    hidden: "#eab308",
    output: "#22c55e",
};

/**
 * Renders a mini WebP thumbnail of the neural network graph.
 * Returns a base64 data URL (image/webp, falls back to png if unsupported).
 * Stores the result in localStorage under `nnn.thumb.{projectId}`.
 */
export async function generateAndStoreThumbnail(
    projectId: string,
    nodes: NeuronNode[],
    edges: ConnectionEdge[],
    isDark = true,
): Promise<string | null> {
    if (typeof window === "undefined" || nodes.length === 0) return null;

    try {
        const canvas = document.createElement("canvas");
        canvas.width = THUMB_W;
        canvas.height = THUMB_H;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        // Background
        ctx.fillStyle = isDark ? "#0a0a0a" : "#ffffff";
        ctx.fillRect(0, 0, THUMB_W, THUMB_H);

        // Compute bounding box of all nodes
        const xs = nodes.map((n) => n.position.x);
        const ys = nodes.map((n) => n.position.y);
        const minX = Math.min(...xs) - PADDING;
        const minY = Math.min(...ys) - PADDING;
        const maxX = Math.max(...xs) + NODE_W + PADDING;
        const maxY = Math.max(...ys) + NODE_H + PADDING;
        const dataW = maxX - minX;
        const dataH = maxY - minY;

        // Scale to fit thumbnail, preserving aspect ratio
        const scaleX = THUMB_W / dataW;
        const scaleY = THUMB_H / dataH;
        const scale = Math.min(scaleX, scaleY, 1.2); // cap at 1.2× to avoid giant single nodes

        // Center offset
        const offsetX = (THUMB_W - dataW * scale) / 2 - minX * scale;
        const offsetY = (THUMB_H - dataH * scale) / 2 - minY * scale;

        const toX = (x: number) => x * scale + offsetX;
        const toY = (y: number) => y * scale + offsetY;
        const nw = NODE_W * scale;
        const nh = NODE_H * scale;

        // Draw edges first (behind nodes)
        edges.forEach((e) => {
            const src = nodes.find((n) => n.id === e.source);
            const tgt = nodes.find((n) => n.id === e.target);
            if (!src || !tgt) return;

            const x1 = toX(src.position.x) + nw / 2;
            const y1 = toY(src.position.y) + nh / 2;
            const x2 = toX(tgt.position.x) + nw / 2;
            const y2 = toY(tgt.position.y) + nh / 2;
            const w = e.data?.weight ?? 0;

            ctx.strokeStyle =
                w >= 0 ? "rgba(234,179,8,0.55)" : "rgba(239,68,68,0.55)";
            ctx.lineWidth = Math.max(0.5, Math.min(2.5, Math.abs(w) * 1.2));
            ctx.beginPath();
            ctx.moveTo(x1, y1);

            // Gentle bezier curve
            const cpx = (x1 + x2) / 2;
            ctx.bezierCurveTo(cpx, y1, cpx, y2, x2, y2);
            ctx.stroke();
        });

        // Draw nodes on top
        nodes.forEach((n) => {
            const x = toX(n.position.x);
            const y = toY(n.position.y);
            const color = NODE_COLORS[n.data.neuronType] ?? "#888";
            // Circle node
            const radius = Math.min(nw, nh);
            const cx = x + nw / 2;
            const cy = y + nh / 2;

            ctx.fillStyle = color + "22";
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;

            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });

        // Subtle vignette overlay
        const vignette = ctx.createRadialGradient(
            THUMB_W / 2,
            THUMB_H / 2,
            THUMB_H * 0.2,
            THUMB_W / 2,
            THUMB_H / 2,
            THUMB_H * 0.85,
        );
        vignette.addColorStop(0, "transparent");
        vignette.addColorStop(
            1,
            isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)",
        );
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, THUMB_W, THUMB_H);

        // Try WebP first, fall back to PNG
        const dataUrl =
            canvas.toDataURL("image/webp", 0.85) ||
            canvas.toDataURL("image/png");

        localStorage.setItem(`nnn.thumb.${projectId}`, dataUrl);
        return dataUrl;
    } catch (err) {
        console.warn("Failed to generate thumbnail", err);
        return null;
    }
}

/** Read a cached thumbnail from localStorage. */
export function getStoredThumbnail(projectId: string): string | null {
    if (typeof window === "undefined") return null;
    try {
        return localStorage.getItem(`nnn.thumb.${projectId}`);
    } catch {
        return null;
    }
}

/** Remove a cached thumbnail from localStorage. */
export function removeStoredThumbnail(projectId: string) {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(`nnn.thumb.${projectId}`);
    } catch {
        // ignore
    }
}
