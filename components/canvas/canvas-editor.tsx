/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useRef } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    type OnConnect,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    useReactFlow,
    ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { NeuronNode } from "./neuron-node";
import { ConnectionEdge } from "./connection-edge";
import { CanvasToolbar } from "./canvas-toolbar";
import { NodePropertiesPanel } from "./node-properties-panel";
import { useCanvasStore } from "@/store/canvas-store";
import { useUIStore } from "@/store/ui-store";
import { useSimulationStore } from "@/store/simulation-store";
import type { NeuronNode as NeuronNodeType, NeuronType } from "@/types";
import { generateId, debounce, cn } from "@/lib/utils";

const nodeTypes = { neuron: NeuronNode };
const edgeTypes = { connection: ConnectionEdge };

const defaultEdgeOptions = {
    type: "connection",
    animated: false,
    data: { weight: Math.random() * 2 - 1, isEnabled: true },
};

interface CanvasEditorInnerProps {
    projectId: string;
    projectTitle: string;
    onSave?: () => Promise<void>;
    isSaving?: boolean;
}

function CanvasEditorInner({
    projectId,
    projectTitle,
    onSave,
    isSaving,
}: CanvasEditorInnerProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();

    const {
        nodes,
        edges,
        settings,
        viewport,
        setNodes,
        setEdges,
        setViewport,
        addNode,
        addEdge: storeAddEdge,
        setSelectedNodeIds,
        setSelectedEdgeIds,
        updateSettings,
    } = useCanvasStore();

    const { openPanel, closePanel, panel } = useUIStore();
    const { runForwardPass, isRunning, activationValues } =
        useSimulationStore();

    // Debounced save
    const debouncedSave = useCallback(
        debounce(async () => {
            if (onSave) await onSave();
        }, 2000),
        [onSave],
    );

    // Auto-run simulation
    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            runForwardPass(nodes, edges);
        }, 500);
        return () => clearInterval(interval);
    }, [isRunning, nodes, edges, runForwardPass]);

    const onNodesChange = useCallback(
        (changes: any) => {
            setNodes(
                applyNodeChanges(changes, nodes as any) as NeuronNodeType[],
            );
        },
        [nodes, setNodes],
    );

    const onEdgesChange = useCallback(
        (changes: any) => {
            setEdges(applyEdgeChanges(changes, edges as any) as any);
        },
        [edges, setEdges],
    );

    const onConnect: OnConnect = useCallback(
        (connection) => {
            const weight = parseFloat((Math.random() * 2 - 1).toFixed(3));
            const newEdge = addEdge(
                {
                    ...connection,
                    type: "connection",
                    data: { weight, isEnabled: true } as Record<
                        string,
                        unknown
                    >,
                    id: generateId(),
                },
                edges as any[],
            );
            setEdges(newEdge as any);
        },
        [edges, setEdges],
    );

    const onSelectionChange = useCallback(
        ({ nodes: selectedNodes, edges: selectedEdges }: any) => {
            setSelectedNodeIds(selectedNodes.map((n: any) => n.id));
            setSelectedEdgeIds(selectedEdges.map((e: any) => e.id));
        },
        [setSelectedNodeIds, setSelectedEdgeIds],
    );

    const onNodeDoubleClick = useCallback(
        (_: React.MouseEvent, node: any) => {
            openPanel("node", node.id);
        },
        [openPanel],
    );

    const onEdgeDoubleClick = useCallback(
        (_: React.MouseEvent, edge: any) => {
            openPanel("edge", edge.id);
        },
        [openPanel],
    );

    const onPaneClick = useCallback(() => {
        closePanel();
    }, [closePanel]);

    const addNeuron = useCallback(
        (type: NeuronType) => {
            const center = screenToFlowPosition({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
            });
            const id = generateId();
            const labelMap = {
                input: "Input",
                hidden: "Hidden",
                output: "Output",
            };
            const activationMap = {
                input: "linear" as const,
                hidden: "relu" as const,
                output: "sigmoid" as const,
            };

            const newNode: NeuronNodeType = {
                id,
                type: "neuron",
                position: {
                    x: center.x + (Math.random() - 0.5) * 100,
                    y: center.y + (Math.random() - 0.5) * 100,
                },
                data: {
                    id,
                    label: `${labelMap[type]} ${nodes.filter((n) => n.data.neuronType === type).length + 1}`,
                    neuronType: type,
                    activationFunction: activationMap[type],
                    bias: 0,
                },
            };
            addNode(newNode);
        },
        [nodes, addNode, screenToFlowPosition],
    );

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const mod = e.metaKey || e.ctrlKey;
            if (mod && e.key === "s") {
                e.preventDefault();
                onSave?.();
            }
            if (e.key === "f" || e.key === "F") {
                // Fit view handled by React Flow
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onSave]);

    const hasPanelOpen = panel.isOpen;

    return (
        <div className="relative w-full h-full">
            <CanvasToolbar
                projectTitle={projectTitle}
                isSaving={isSaving}
                onSave={onSave}
                onAddNeuron={addNeuron}
            />

            <div ref={reactFlowWrapper} className="w-full h-full">
                <ReactFlow
                    nodes={nodes as any}
                    edges={edges as any}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onSelectionChange={onSelectionChange}
                    onNodeDoubleClick={onNodeDoubleClick}
                    onEdgeDoubleClick={onEdgeDoubleClick}
                    onPaneClick={onPaneClick}
                    onMoveEnd={(_: any, vp: any) => setViewport(vp)}
                    nodeTypes={nodeTypes as any}
                    edgeTypes={edgeTypes as any}
                    defaultEdgeOptions={defaultEdgeOptions}
                    defaultViewport={viewport}
                    minZoom={0.1}
                    maxZoom={4}
                    fitViewOptions={{ padding: 0.1 }}
                    deleteKeyCode={["Delete", "Backspace"]}
                    multiSelectionKeyCode={["Meta", "Control"]}
                    selectionKeyCode="Shift"
                    panOnScroll
                    selectionOnDrag
                    panOnDrag={[1, 2]}
                    className={cn(
                        "w-full h-full nnn-canvas",
                        isDark ? "nnn-canvas--dark" : "nnn-canvas--light",
                    )}
                    proOptions={{ hideAttribution: true }}
                    aria-label="Neural network canvas"
                >
                    {settings.gridVisible && (
                        <Background
                            variant={BackgroundVariant.Dots}
                            gap={24}
                            size={1}
                            color={
                                isDark
                                    ? "rgba(255,255,255,0.08)"
                                    : "rgba(0,0,0,0.08)"
                            }
                        />
                    )}
                    <Controls
                        className="!border-border !bg-background !shadow-lg"
                        showInteractive={false}
                    />
                    {settings.showMinimap && (
                        <MiniMap
                            nodeColor={(node) => {
                                const n = node as NeuronNodeType;
                                const type = n.data?.neuronType;
                                if (type === "input") return "#3b82f6";
                                if (type === "output") return "#22c55e";
                                return "#eab308";
                            }}
                            maskColor={
                                isDark
                                    ? "rgba(0,0,0,0.7)"
                                    : "rgba(255,255,255,0.7)"
                            }
                            className="!border-border !bg-surface !rounded-lg"
                            pannable
                            zoomable
                        />
                    )}
                </ReactFlow>
            </div>

            {/* Side panel */}
            <div
                className={cn(
                    "absolute right-0 top-0 bottom-0 overflow-hidden pointer-events-none nnn-side-panel",
                    hasPanelOpen
                        ? "nnn-side-panel--open"
                        : "nnn-side-panel--closed",
                )}
            >
                <div className="pointer-events-auto h-full">
                    <NodePropertiesPanel />
                </div>
            </div>
        </div>
    );
}

export function CanvasEditor(props: CanvasEditorInnerProps) {
    return (
        <ReactFlowProvider>
            <CanvasEditorInner {...props} />
        </ReactFlowProvider>
    );
}
