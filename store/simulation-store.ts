import { create } from 'zustand';
import type { NeuronNode, ConnectionEdge } from '@/types';
import { applyActivation, clamp } from '@/lib/utils';

interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  stepMode: boolean;
  currentStep: number;
  speed: number;
  inputValues: Record<string, number>;
  activationValues: Record<string, number>;
  weightContributions: Record<string, number>;
  activeNodeIds: Set<string>;
  activeEdgeIds: Set<string>;
  propagationOrder: string[][];

  setRunning: (isRunning: boolean) => void;
  setPaused: (isPaused: boolean) => void;
  setStepMode: (stepMode: boolean) => void;
  setSpeed: (speed: number) => void;
  setInputValue: (nodeId: string, value: number) => void;
  setInputValues: (values: Record<string, number>) => void;

  runForwardPass: (nodes: NeuronNode[], edges: ConnectionEdge[]) => void;
  stepForward: (nodes: NeuronNode[], edges: ConnectionEdge[]) => void;
  reset: () => void;
  computePropagationOrder: (nodes: NeuronNode[], edges: ConnectionEdge[]) => string[][];
}

function topologicalSort(nodes: NeuronNode[], edges: ConnectionEdge[]): string[][] {
  const inDegree: Record<string, number> = {};
  const adjacency: Record<string, string[]> = {};

  for (const node of nodes) {
    inDegree[node.id] = 0;
    adjacency[node.id] = [];
  }

  for (const edge of edges) {
    if (edge.data?.isEnabled !== false) {
      adjacency[edge.source].push(edge.target);
      inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
    }
  }

  const layers: string[][] = [];
  const queue: string[] = Object.entries(inDegree)
    .filter(([, deg]) => deg === 0)
    .map(([id]) => id);

  while (queue.length > 0) {
    layers.push([...queue]);
    const nextQueue: string[] = [];
    for (const nodeId of queue) {
      for (const neighbor of adjacency[nodeId] || []) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          nextQueue.push(neighbor);
        }
      }
    }
    queue.length = 0;
    queue.push(...nextQueue);
  }

  return layers;
}

export const useSimulationStore = create<SimulationState>()((set, get) => ({
  isRunning: false,
  isPaused: false,
  stepMode: false,
  currentStep: 0,
  speed: 1,
  inputValues: {},
  activationValues: {},
  weightContributions: {},
  activeNodeIds: new Set(),
  activeEdgeIds: new Set(),
  propagationOrder: [],

  setRunning: (isRunning) => set({ isRunning }),
  setPaused: (isPaused) => set({ isPaused }),
  setStepMode: (stepMode) => set({ stepMode }),
  setSpeed: (speed) => set({ speed }),

  setInputValue: (nodeId, value) =>
    set((state) => ({
      inputValues: { ...state.inputValues, [nodeId]: value },
    })),

  setInputValues: (values) => set({ inputValues: values }),

  computePropagationOrder: (nodes, edges) => {
    const order = topologicalSort(nodes, edges);
    set({ propagationOrder: order });
    return order;
  },

  runForwardPass: (nodes, edges) => {
    const { inputValues } = get();
    const activations: Record<string, number> = {};
    const contributions: Record<string, number> = {};

    const order = topologicalSort(nodes, edges);

    for (const layer of order) {
      for (const nodeId of layer) {
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) continue;

        if (node.data.neuronType === 'input') {
          activations[nodeId] = inputValues[nodeId] ?? 0;
        } else {
          // Sum weighted inputs
          let weightedSum = node.data.bias || 0;
          const incomingEdges = edges.filter(
            (e) => e.target === nodeId && e.data?.isEnabled !== false
          );

          for (const edge of incomingEdges) {
            const sourceActivation = activations[edge.source] ?? 0;
            const weight = edge.data?.weight ?? 1;
            weightedSum += sourceActivation * weight;
            contributions[edge.id] = sourceActivation * weight;
          }

          activations[nodeId] = applyActivation(
            weightedSum,
            node.data.activationFunction || 'relu'
          );
        }
      }
    }

    // Normalize for visualization
    const values = Object.values(activations);
    const maxVal = Math.max(...values.map(Math.abs), 1);

    const normalized: Record<string, number> = {};
    for (const [id, val] of Object.entries(activations)) {
      normalized[id] = clamp(val / maxVal, -1, 1);
    }

    set({
      activationValues: activations,
      weightContributions: contributions,
      propagationOrder: order,
      currentStep: order.length,
    });
  },

  stepForward: (nodes, edges) => {
    const { currentStep, propagationOrder, inputValues } = get();

    if (propagationOrder.length === 0) {
      const order = topologicalSort(nodes, edges);
      set({ propagationOrder: order });
    }

    const { propagationOrder: order } = get();
    if (currentStep >= order.length) return;

    const activations = { ...get().activationValues };

    const currentLayer = order[currentStep];
    for (const nodeId of currentLayer) {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) continue;

      if (node.data.neuronType === 'input') {
        activations[nodeId] = inputValues[nodeId] ?? 0;
      } else {
        let weightedSum = node.data.bias || 0;
        const incomingEdges = edges.filter(
          (e) => e.target === nodeId && e.data?.isEnabled !== false
        );

        for (const edge of incomingEdges) {
          const sourceActivation = activations[edge.source] ?? 0;
          weightedSum += sourceActivation * (edge.data?.weight ?? 1);
        }

        activations[nodeId] = applyActivation(
          weightedSum,
          node.data.activationFunction || 'relu'
        );
      }
    }

    const activeNodeIds = new Set(currentLayer);
    const activeEdgeIds = new Set(
      edges
        .filter((e) => currentLayer.includes(e.target))
        .map((e) => e.id)
    );

    set({
      activationValues: activations,
      activeNodeIds,
      activeEdgeIds,
      currentStep: currentStep + 1,
    });
  },

  reset: () =>
    set({
      isRunning: false,
      isPaused: false,
      currentStep: 0,
      activationValues: {},
      weightContributions: {},
      activeNodeIds: new Set(),
      activeEdgeIds: new Set(),
      propagationOrder: [],
    }),
}));
