"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Copy, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCanvasStore } from "@/store/canvas-store";
import { useUIStore } from "@/store/ui-store";
import { useSimulationStore } from "@/store/simulation-store";
import type { ActivationFunction, NeuronType } from "@/types";
import { cn } from "@/lib/utils";

const ACTIVATION_FUNCTIONS: {
    value: ActivationFunction;
    label: string;
    desc: string;
}[] = [
    { value: "relu", label: "ReLU", desc: "max(0, x)" },
    { value: "sigmoid", label: "Sigmoid", desc: "1/(1+e⁻ˣ)" },
    { value: "tanh", label: "Tanh", desc: "tanh(x)" },
    { value: "linear", label: "Linear", desc: "f(x) = x" },
    { value: "softmax", label: "Softmax", desc: "e^xᵢ/Σe^xⱼ" },
];

const NEURON_TYPE_LABELS: Record<NeuronType, string> = {
    input: "Input",
    hidden: "Hidden",
    output: "Output",
};

export function NodePropertiesPanel() {
    const { panel, closePanel } = useUIStore();
    const { nodes, updateNode, removeNode, duplicateNode } = useCanvasStore();
    const { activationValues, setInputValue } = useSimulationStore();

    const isOpen = panel.isOpen && panel.panelType === "node";
    const nodeId = panel.activeNodeId;
    const node = nodes.find((n) => n.id === nodeId);
    const data = node?.data;

    const handleDelete = useCallback(() => {
        if (nodeId) {
            removeNode(nodeId);
            closePanel();
        }
    }, [nodeId, removeNode, closePanel]);

    const handleDuplicate = useCallback(() => {
        if (nodeId) duplicateNode(nodeId);
    }, [nodeId, duplicateNode]);

    const handleUpdate = useCallback(
        (updates: Partial<typeof data>) => {
            if (nodeId && data)
                updateNode(nodeId, { ...data, ...updates } as typeof data);
        },
        [nodeId, data, updateNode],
    );

    if (!data) return null;

    const activationValue = nodeId ? activationValues[nodeId] : undefined;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: 320, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 320, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={cn(
                        "absolute right-0 top-0 bottom-0 z-10 w-72",
                        "bg-background/95 backdrop-blur-xl border-l border-border",
                        "flex flex-col overflow-hidden",
                    )}
                    aria-label="Node properties panel"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={
                                    data.neuronType as
                                        | "input"
                                        | "hidden"
                                        | "output"
                                }
                            >
                                {NEURON_TYPE_LABELS[data.neuronType]}
                            </Badge>
                            <span className="text-sm font-medium text-foreground">
                                Neuron
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={handleDuplicate}
                                aria-label="Duplicate neuron"
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={handleDelete}
                                className="text-destructive hover:text-destructive"
                                aria-label="Delete neuron"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={closePanel}
                                aria-label="Close panel"
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        {/* Activation display */}
                        {activationValue !== undefined && (
                            <div className="rounded-lg border border-border bg-secondary/50 p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="h-4 w-4 text-nnn-yellow" />
                                    <span className="text-xs font-medium text-foreground">
                                        Current Activation
                                    </span>
                                </div>
                                <div className="text-2xl font-mono font-bold text-foreground">
                                    {activationValue.toFixed(4)}
                                </div>
                                <div className="mt-2 h-1.5 w-full rounded-full bg-border overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full bg-nnn-yellow transition-all duration-300 nnn-activation-fill",
                                            `[--activation-width:${Math.abs(activationValue) * 100}%]`,
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Name
                            </label>
                            <input
                                type="text"
                                value={data.label}
                                onChange={(e) =>
                                    handleUpdate({ label: e.target.value })
                                }
                                className={cn(
                                    "w-full h-9 px-3 rounded-md border border-input bg-background text-sm",
                                    "focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
                                )}
                                placeholder="Neuron name"
                            />
                        </div>

                        {/* Neuron Type */}
                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Type
                            </label>
                            <Select
                                value={data.neuronType}
                                onValueChange={(v) =>
                                    handleUpdate({
                                        neuronType: v as NeuronType,
                                    })
                                }
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="input">Input</SelectItem>
                                    <SelectItem value="hidden">
                                        Hidden
                                    </SelectItem>
                                    <SelectItem value="output">
                                        Output
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Activation Function */}
                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Activation Function
                            </label>
                            <Select
                                value={data.activationFunction}
                                onValueChange={(v) =>
                                    handleUpdate({
                                        activationFunction:
                                            v as ActivationFunction,
                                    })
                                }
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ACTIVATION_FUNCTIONS.map((fn) => (
                                        <SelectItem
                                            key={fn.value}
                                            value={fn.value}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{fn.label}</span>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    {fn.desc}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Bias */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Bias
                                </label>
                                <span className="text-xs font-mono text-foreground">
                                    {(data.bias ?? 0).toFixed(3)}
                                </span>
                            </div>
                            <Slider
                                min={-2}
                                max={2}
                                step={0.01}
                                value={[data.bias ?? 0]}
                                onValueChange={([v]) =>
                                    handleUpdate({ bias: v })
                                }
                                className="mt-2"
                                aria-label="Bias value"
                            />
                        </div>

                        {/* Input value (for input neurons) */}
                        {data.neuronType === "input" && nodeId && (
                            <>
                                <Separator />
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            Input Value
                                        </label>
                                        <span className="text-xs font-mono text-foreground">
                                            {(activationValue ?? 0).toFixed(3)}
                                        </span>
                                    </div>
                                    <Slider
                                        min={-1}
                                        max={1}
                                        step={0.01}
                                        value={[activationValue ?? 0]}
                                        onValueChange={([v]) =>
                                            setInputValue(nodeId, v)
                                        }
                                        className="mt-2"
                                        aria-label="Input value"
                                    />
                                </div>
                            </>
                        )}

                        <Separator />

                        {/* Description */}
                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Description
                            </label>
                            <textarea
                                value={data.description ?? ""}
                                onChange={(e) =>
                                    handleUpdate({
                                        description: e.target.value,
                                    })
                                }
                                className={cn(
                                    "w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none",
                                    "focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
                                    "placeholder:text-muted-foreground",
                                )}
                                placeholder="Add a description…"
                                rows={3}
                            />
                        </div>

                        {/* Custom Color */}
                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Custom Color
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={data.color ?? "#FFD60A"}
                                    onChange={(e) =>
                                        handleUpdate({ color: e.target.value })
                                    }
                                    className="h-9 w-12 rounded border border-input cursor-pointer bg-background p-1"
                                    aria-label="Custom color"
                                />
                                <button
                                    onClick={() =>
                                        handleUpdate({ color: undefined })
                                    }
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Node ID (read only) */}
                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Node ID
                            </label>
                            <code className="text-xs text-muted-foreground font-mono bg-secondary rounded px-2 py-1 block truncate">
                                {nodeId}
                            </code>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
