/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { memo } from "react";
import {
    type EdgeProps,
    getBezierPath,
    EdgeLabelRenderer,
    BaseEdge,
} from "@xyflow/react";
import { cn } from "@/lib/utils";
import { getWeightColor, getWeightThickness } from "@/lib/utils";
import { useSimulationStore } from "@/store/simulation-store";

interface ConnectionEdgeData {
    weight: number;
    isEnabled: boolean;
    label?: string;
}

function ConnectionEdgeComponent(props: EdgeProps) {
    const {
        id,
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        data,
        selected,
        markerEnd,
    } = props;
    const edgeData = data as unknown as ConnectionEdgeData | undefined;
    const { activeEdgeIds, weightContributions } = useSimulationStore();

    const weight = edgeData?.weight ?? 1;
    const isEnabled = edgeData?.isEnabled !== false;
    const isActive = activeEdgeIds?.has(id) ?? false;
    const contribution = weightContributions?.[id];

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const strokeColor = isActive
        ? "hsl(48 100% 52%)"
        : getWeightColor(weight, true);

    const strokeWidth = isActive
        ? getWeightThickness(weight) + 1
        : getWeightThickness(weight);

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                className={cn(
                    "nnn-connection-edge",
                    !isEnabled && "nnn-connection-edge--disabled",
                    isActive && "nnn-connection-edge--active",
                    `[--edge-stroke:${strokeColor}]`,
                    `[--edge-width:${strokeWidth}]`,
                )}
            />

            {/* Weight label */}
            <EdgeLabelRenderer>
                <div
                    className={cn(
                        `[--label-x:${labelX}px]`,
                        `[--label-y:${labelY}px]`,
                        "nnn-edge-label rounded px-1.5 py-0.5 text-[9px] font-mono cursor-pointer",
                        "bg-background/90 backdrop-blur-sm border border-border/50",
                        selected
                            ? "text-foreground border-primary"
                            : "text-muted-foreground",
                        !isEnabled && "opacity-50",
                    )}
                >
                    {contribution !== undefined
                        ? contribution.toFixed(2)
                        : weight.toFixed(2)}
                </div>
            </EdgeLabelRenderer>
        </>
    );
}

export const ConnectionEdge = memo(ConnectionEdgeComponent);
