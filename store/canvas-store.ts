import { create } from 'zustand';
import { temporal } from 'zundo';
import type { NeuronNode, ConnectionEdge, LayerData, CanvasSettings, Viewport } from '@/types';
import { generateId } from '@/lib/utils';

interface CanvasState {
  nodes: NeuronNode[];
  edges: ConnectionEdge[];
  layers: LayerData[];
  viewport: Viewport;
  settings: CanvasSettings;
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  isDirty: boolean;
  lastSaved: Date | null;

  // Node actions
  addNode: (node: NeuronNode) => void;
  updateNode: (id: string, data: Partial<NeuronNode['data']>) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  removeNode: (id: string) => void;
  removeNodes: (ids: string[]) => void;
  duplicateNode: (id: string) => void;
  setNodes: (nodes: NeuronNode[]) => void;

  // Edge actions
  addEdge: (edge: ConnectionEdge) => void;
  updateEdge: (id: string, data: Partial<ConnectionEdge['data']>) => void;
  removeEdge: (id: string) => void;
  removeEdges: (ids: string[]) => void;
  setEdges: (edges: ConnectionEdge[]) => void;

  // Layer actions
  addLayer: (layer: LayerData) => void;
  updateLayer: (id: string, data: Partial<LayerData>) => void;
  removeLayer: (id: string) => void;
  setLayers: (layers: LayerData[]) => void;

  // Selection
  setSelectedNodeIds: (ids: string[]) => void;
  setSelectedEdgeIds: (ids: string[]) => void;
  clearSelection: () => void;

  // Viewport
  setViewport: (viewport: Viewport) => void;

  // Settings
  updateSettings: (settings: Partial<CanvasSettings>) => void;

  // State
  markDirty: () => void;
  markSaved: () => void;
  reset: () => void;
  loadCanvasState: (state: {
    nodes: NeuronNode[];
    edges: ConnectionEdge[];
    layers: LayerData[];
    viewport: Viewport;
    settings: CanvasSettings;
  }) => void;
}

const defaultSettings: CanvasSettings = {
  gridVisible: true,
  snapToGrid: false,
  gridSize: 24,
  showMinimap: true,
  showControls: true,
  animationsEnabled: true,
};

const defaultViewport: Viewport = {
  x: 0,
  y: 0,
  zoom: 1,
};

export const useCanvasStore = create<CanvasState>()(
  temporal(
    (set, get) => ({
      nodes: [],
      edges: [],
      layers: [],
      viewport: defaultViewport,
      settings: defaultSettings,
      selectedNodeIds: [],
      selectedEdgeIds: [],
      isDirty: false,
      lastSaved: null,

      addNode: (node) =>
        set((state) => ({
          nodes: [...state.nodes, node],
          isDirty: true,
        })),

      updateNode: (id, data) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...data } } : n
          ),
          isDirty: true,
        })),

      updateNodePosition: (id, position) =>
        set((state) => ({
          nodes: state.nodes.map((n) => (n.id === id ? { ...n, position } : n)),
          isDirty: true,
        })),

      removeNode: (id) =>
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== id),
          edges: state.edges.filter((e) => e.source !== id && e.target !== id),
          isDirty: true,
        })),

      removeNodes: (ids) =>
        set((state) => ({
          nodes: state.nodes.filter((n) => !ids.includes(n.id)),
          edges: state.edges.filter(
            (e) => !ids.includes(e.source) && !ids.includes(e.target)
          ),
          isDirty: true,
        })),

      duplicateNode: (id) => {
        const { nodes } = get();
        const original = nodes.find((n) => n.id === id);
        if (!original) return;
        const newNode: NeuronNode = {
          ...original,
          id: generateId(),
          position: {
            x: original.position.x + 50,
            y: original.position.y + 50,
          },
          data: { ...original.data, label: `${original.data.label} (copy)` },
          selected: false,
        };
        set((state) => ({
          nodes: [...state.nodes, newNode],
          isDirty: true,
        }));
      },

      setNodes: (nodes) => set({ nodes, isDirty: true }),

      addEdge: (edge) =>
        set((state) => ({
          edges: [...state.edges, edge],
          isDirty: true,
        })),

      updateEdge: (id, data) =>
        set((state) => ({
          edges: state.edges.map((e) =>
            e.id === id ? { ...e, data: { ...e.data, ...data } } : e
          ),
          isDirty: true,
        })),

      removeEdge: (id) =>
        set((state) => ({
          edges: state.edges.filter((e) => e.id !== id),
          isDirty: true,
        })),

      removeEdges: (ids) =>
        set((state) => ({
          edges: state.edges.filter((e) => !ids.includes(e.id)),
          isDirty: true,
        })),

      setEdges: (edges) => set({ edges, isDirty: true }),

      addLayer: (layer) =>
        set((state) => ({
          layers: [...state.layers, layer],
          isDirty: true,
        })),

      updateLayer: (id, data) =>
        set((state) => ({
          layers: state.layers.map((l) => (l.id === id ? { ...l, ...data } : l)),
          isDirty: true,
        })),

      removeLayer: (id) =>
        set((state) => ({
          layers: state.layers.filter((l) => l.id !== id),
          isDirty: true,
        })),

      setLayers: (layers) => set({ layers }),

      setSelectedNodeIds: (ids) => set({ selectedNodeIds: ids }),
      setSelectedEdgeIds: (ids) => set({ selectedEdgeIds: ids }),
      clearSelection: () => set({ selectedNodeIds: [], selectedEdgeIds: [] }),

      setViewport: (viewport) => set({ viewport }),

      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      markDirty: () => set({ isDirty: true }),
      markSaved: () => set({ isDirty: false, lastSaved: new Date() }),

      reset: () =>
        set({
          nodes: [],
          edges: [],
          layers: [],
          viewport: defaultViewport,
          settings: defaultSettings,
          selectedNodeIds: [],
          selectedEdgeIds: [],
          isDirty: false,
          lastSaved: null,
        }),

      loadCanvasState: ({ nodes, edges, layers, viewport, settings }) =>
        set({
          nodes,
          edges,
          layers,
          viewport,
          settings,
          isDirty: false,
        }),
    }),
    {
      limit: 50,
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        layers: state.layers,
      }),
    }
  )
);
