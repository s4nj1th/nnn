// ============================================================
// Core Neural Network Types
// ============================================================

export type ActivationFunction = 'relu' | 'sigmoid' | 'tanh' | 'linear' | 'softmax';

export type NeuronType = 'input' | 'hidden' | 'output';

export type LayerType =
  | 'input'
  | 'dense'
  | 'hidden'
  | 'output'
  | 'dropout'
  | 'embedding';

export type AccentColor = 'yellow' | 'blue' | 'purple' | 'green' | 'orange';

export type Theme = 'light' | 'dark' | 'system';

// ============================================================
// Neuron
// ============================================================

export interface NeuronData extends Record<string, unknown> {
  id: string;
  label: string;
  neuronType: NeuronType;
  activationFunction: ActivationFunction;
  bias: number;
  description?: string;
  color?: string;
  layerId?: string;
  value?: number;
  activationValue?: number;
  isActive?: boolean;
}

// ============================================================
// Connection / Edge
// ============================================================

export interface ConnectionData extends Record<string, unknown> {
  id: string;
  sourceId: string;
  targetId: string;
  weight: number;
  label?: string;
  isEnabled: boolean;
}

export interface EdgeData extends Record<string, unknown> {
  weight?: number;
  isEnabled?: boolean;
  label?: string;
}

// ============================================================
// Layer
// ============================================================

export interface LayerData {
  id: string;
  name: string;
  layerType: LayerType;
  neuronIds: string[];
  color?: string;
  isCollapsed?: boolean;
}

// ============================================================
// Canvas State
// ============================================================

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface CanvasSettings {
  gridVisible: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showMinimap: boolean;
  showControls: boolean;
  animationsEnabled: boolean;
}

export interface SimulationSettings {
  inputValues: Record<string, number>;
  stepMode: boolean;
  autoRun: boolean;
  speed: number;
  currentStep: number;
}

export interface CanvasState {
  nodes: NeuronNode[];
  edges: ConnectionEdge[];
  viewport: Viewport;
  settings: CanvasSettings;
  simulation: SimulationSettings;
  layers: LayerData[];
}

// ============================================================
// React Flow Extended Types
// ============================================================

import type { Node, Edge } from '@xyflow/react';

export type NeuronNode = Node<NeuronData, 'neuron'>;
export type ConnectionEdge = Edge<EdgeData>;

// ============================================================
// Project Types
// ============================================================

export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  thumbnail?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithData extends Project {
  canvasState: CanvasState;
}

export interface ProjectCollaborator {
  id: string;
  projectId: string;
  userId: string;
  role: 'viewer' | 'editor' | 'admin';
}

// ============================================================
// User Types
// ============================================================

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  theme: Theme;
  accentColor: AccentColor;
  gridVisible: boolean;
  gridDensity: 'sparse' | 'normal' | 'dense';
  animationsEnabled: boolean;
}

// ============================================================
// API Types
// ============================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  perPage: number;
}

// ============================================================
// Activity Log
// ============================================================

export interface ActivityLog {
  id: string;
  userId: string;
  projectId?: string;
  action: string;
  timestamp: string;
}

// ============================================================
// Template Types
// ============================================================

export interface ExampleTemplate {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  canvasState: CanvasState;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// ============================================================
// UI Types
// ============================================================

export interface PanelState {
  isOpen: boolean;
  activeNodeId?: string;
  activeEdgeId?: string;
  activeLayerId?: string;
  panelType?: 'node' | 'edge' | 'layer' | 'settings';
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface KeyboardShortcut {
  key: string;
  modifiers: ('ctrl' | 'cmd' | 'shift' | 'alt')[];
  description: string;
  action: string;
}
