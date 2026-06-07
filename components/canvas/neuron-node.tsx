/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { memo, useCallback } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { NeuronData } from "@/types";
import { useSimulationStore } from "@/store/simulation-store";
import { useUIStore } from "@/store/ui-store";

const activationLabels: Record<string, string> = {
    relu: "ReLU",
    sigmoid: "σ",
    tanh: "tanh",
    linear: "f(x)",
    softmax: "SM",
};

const neuronTypeColors: Record<
    string,
    {
        border: string;
        bg: string;
        label: string;
        handle: string;
        glow: string;
    }
> = {
    input: {
        border: "border-blue-500/60",
        bg: "bg-blue-500/10",
        label: "text-blue-400",
        handle: "bg-blue-500",
        glow: "shadow-blue-500/20",
    },
    hidden: {
        border: "border-yellow-500/60",
        bg: "bg-yellow-500/10",
        label: "text-yellow-400",
        handle: "bg-yellow-500",
        glow: "shadow-yellow-500/20",
    },
    output: {
        border: "border-green-500/60",
        bg: "bg-green-500/10",
        label: "text-green-400",
        handle: "bg-green-500",
        glow: "shadow-green-500/20",
    },
};

function NeuronNodeComponent({ data, selected, id }: NodeProps) {
    const neuronData = data as unknown as NeuronData;
    const { activationValues, activeNodeIds } = useSimulationStore();
    const { openPanel } = useUIStore();

    const colors =
        neuronTypeColors[neuronData.neuronType as string] ??
        neuronTypeColors.hidden;
    const activation = activationValues[id];
    const isActive = (activeNodeIds as Set<string>)?.has(id) ?? false;
    const hasActivation = activation !== undefined;
    const activationIntensity = hasActivation ? Math.abs(activation) : 0;

    const handleDoubleClick = useCallback(() => {
        openPanel("node", id);
    }, [id, openPanel]);

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="group"
            onDoubleClick={handleDoubleClick}
        >
            {/* Input handles (left) */}
            {neuronData.neuronType !== "input" && (
                <Handle type="target" position={Position.Left} />
            )}

            {/* Neuron body */}
            <div
                className={cn(
                    "relative flex flex-col items-center justify-center rounded-full cursor-pointer select-none",
                    "border-2 transition-all duration-200",
                    "w-16 h-16 nnn-neuron-body",
                    colors.border,
                    colors.bg,
                    selected &&
                        "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    isActive && "shadow-lg",
                    isActive && colors.glow,
                    hasActivation &&
                        (activation >= 0
                            ? "nnn-neuron-body--has-activation-positive"
                            : "nnn-neuron-body--has-activation-negative"),
                    hasActivation &&
                        `[--activation-intensity:${activationIntensity}]`,
                )}
            >
                {/* Custom color overlay */}
                {neuronData.color && (
                    <div
                        className={cn(
                            "absolute inset-0 rounded-full opacity-20 nnn-neuron-overlay",
                            `[--neuron-color:${neuronData.color}]`,
                        )}
                    />
                )}

                {/* Activation function label */}
                <span
                    className={cn(
                        "text-xs font-mono font-bold z-10",
                        colors.label,
                    )}
                >
                    {activationLabels[
                        neuronData.activationFunction as string
                    ] ?? String(neuronData.activationFunction)}
                </span>

                {/* Activation value display */}
                {hasActivation && (
                    <span className="text-[9px] font-mono text-muted-foreground z-10 leading-none mt-0.5">
                        {activation.toFixed(2)}
                    </span>
                )}

                {/* Bias indicator */}
                {Math.abs(neuronData.bias as number) > 0.01 && (
                    <div
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-surface border border-border flex items-center justify-center"
                        title={`Bias: ${(neuronData.bias as number).toFixed(2)}`}
                    >
                        <span className="text-[7px] text-muted-foreground">
                            b
                        </span>
                    </div>
                )}

                {/* Active pulse ring */}
                {isActive && (
                    <motion.div
                        className={cn(
                            "absolute inset-0 rounded-full border-2",
                            colors.border,
                        )}
                        animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                )}
            </div>

            {/* Label below */}
            <div
                className={cn(
                    "mt-1 px-2 py-0.5 rounded text-center max-w-[80px]",
                    "bg-background/80 backdrop-blur-sm border border-border/50",
                    "text-[10px] font-medium text-foreground truncate",
                )}
                title={neuronData.label as string}
            >
                {String(neuronData.label)}
            </div>

            {/* Output handle (right) */}
            {neuronData.neuronType !== "output" && (
                <Handle type="source" position={Position.Right} />
            )}
        </motion.div>
    );
}

export const NeuronNode = memo(NeuronNodeComponent);
