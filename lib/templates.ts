import type { ExampleTemplate, CanvasState } from '@/types';
import { generateId } from '@/lib/utils';

function makeNode(
  id: string,
  x: number,
  y: number,
  label: string,
  type: 'input' | 'hidden' | 'output',
  activation: string = 'relu',
  bias = 0
) {
  return {
    id,
    type: 'neuron' as const,
    position: { x, y },
    data: {
      id,
      label,
      neuronType: type,
      activationFunction: activation as any,
      bias,
    },
  };
}

function makeEdge(source: string, target: string, weight: number) {
  return {
    id: generateId(),
    source,
    target,
    type: 'connection' as const,
    data: { weight, isEnabled: true },
  };
}

const defaultSettings = {
  gridVisible: true,
  snapToGrid: false,
  gridSize: 24,
  showMinimap: true,
  showControls: true,
  animationsEnabled: true,
};

const defaultViewport = { x: 0, y: 0, zoom: 0.9 };

const defaultSimulation = {
  inputValues: {},
  stepMode: false,
  autoRun: false,
  speed: 1,
  currentStep: 0,
};

// ── XOR Network ─────────────────────────────────────────────
const xorNodes = [
  makeNode('x1', 60, 120, 'X₁', 'input', 'linear'),
  makeNode('x2', 60, 240, 'X₂', 'input', 'linear'),
  makeNode('h1', 240, 80, 'H₁', 'hidden', 'sigmoid', -0.5),
  makeNode('h2', 240, 200, 'H₂', 'hidden', 'sigmoid', 0.5),
  makeNode('h3', 240, 320, 'H₃', 'hidden', 'sigmoid', -0.5),
  makeNode('o1', 420, 200, 'Output', 'output', 'sigmoid', -0.5),
];
const xorEdges = [
  makeEdge('x1', 'h1', 1.2), makeEdge('x1', 'h2', -0.9), makeEdge('x1', 'h3', 0.7),
  makeEdge('x2', 'h1', 1.1), makeEdge('x2', 'h2', 0.8), makeEdge('x2', 'h3', -1.1),
  makeEdge('h1', 'o1', 1.5), makeEdge('h2', 'o1', -2.0), makeEdge('h3', 'o1', 1.5),
];

// ── Multi-Layer Perceptron ────────────────────────────────────
const mlpNodes = [
  makeNode('i1', 60, 60, 'Input₁', 'input', 'linear'),
  makeNode('i2', 60, 150, 'Input₂', 'input', 'linear'),
  makeNode('i3', 60, 240, 'Input₃', 'input', 'linear'),
  makeNode('i4', 60, 330, 'Input₄', 'input', 'linear'),
  makeNode('h1a', 230, 60, 'Hidden₁', 'hidden', 'relu', 0.1),
  makeNode('h1b', 230, 150, 'Hidden₂', 'hidden', 'relu', -0.2),
  makeNode('h1c', 230, 240, 'Hidden₃', 'hidden', 'relu', 0.15),
  makeNode('h1d', 230, 330, 'Hidden₄', 'hidden', 'relu', 0.05),
  makeNode('h2a', 400, 105, 'Dense₁', 'hidden', 'relu', 0.1),
  makeNode('h2b', 400, 195, 'Dense₂', 'hidden', 'relu', -0.1),
  makeNode('h2c', 400, 285, 'Dense₃', 'hidden', 'relu', 0.2),
  makeNode('o1', 570, 150, 'Out₁', 'output', 'sigmoid'),
  makeNode('o2', 570, 240, 'Out₂', 'output', 'sigmoid'),
];
const mlpEdges = [
  ...['i1','i2','i3','i4'].flatMap(i =>
    ['h1a','h1b','h1c','h1d'].map(h => makeEdge(i, h, Math.random()*2-1))
  ),
  ...['h1a','h1b','h1c','h1d'].flatMap(h =>
    ['h2a','h2b','h2c'].map(d => makeEdge(h, d, Math.random()*2-1))
  ),
  ...['h2a','h2b','h2c'].flatMap(d =>
    ['o1','o2'].map(o => makeEdge(d, o, Math.random()*2-1))
  ),
];

// ── Simple Binary Classifier ──────────────────────────────────
const binNodes = [
  makeNode('f1', 60, 100, 'Feature₁', 'input', 'linear'),
  makeNode('f2', 60, 220, 'Feature₂', 'input', 'linear'),
  makeNode('h1', 240, 100, 'Hidden₁', 'hidden', 'tanh', 0.2),
  makeNode('h2', 240, 220, 'Hidden₂', 'hidden', 'tanh', -0.1),
  makeNode('out', 420, 160, 'Class', 'output', 'sigmoid', -0.3),
];
const binEdges = [
  makeEdge('f1', 'h1', 0.8), makeEdge('f1', 'h2', -0.5),
  makeEdge('f2', 'h1', 0.6), makeEdge('f2', 'h2', 0.9),
  makeEdge('h1', 'out', 1.2), makeEdge('h2', 'out', -0.7),
];

// ── Backprop Demo ─────────────────────────────────────────────
const bpNodes = [
  makeNode('bp_i1', 60, 150, 'x₁', 'input', 'linear'),
  makeNode('bp_i2', 60, 250, 'x₂', 'input', 'linear'),
  makeNode('bp_h1', 240, 100, 'a₁', 'hidden', 'sigmoid', 0.1),
  makeNode('bp_h2', 240, 200, 'a₂', 'hidden', 'sigmoid', -0.2),
  makeNode('bp_h3', 240, 300, 'a₃', 'hidden', 'sigmoid', 0.15),
  makeNode('bp_o1', 420, 200, 'ŷ', 'output', 'sigmoid', -0.1),
];
const bpEdges = [
  makeEdge('bp_i1','bp_h1', 0.5), makeEdge('bp_i1','bp_h2', -0.8), makeEdge('bp_i1','bp_h3', 0.3),
  makeEdge('bp_i2','bp_h1', -0.6), makeEdge('bp_i2','bp_h2', 0.7), makeEdge('bp_i2','bp_h3', 0.9),
  makeEdge('bp_h1','bp_o1', 1.1), makeEdge('bp_h2','bp_o1', -0.9), makeEdge('bp_h3','bp_o1', 0.6),
];

// ── Deep Hidden Layers ────────────────────────────────────────
const deepNodes = [
  makeNode('d_i1', 60, 120, 'Input₁', 'input', 'linear'),
  makeNode('d_i2', 60, 240, 'Input₂', 'input', 'linear'),
  ...Array.from({ length: 4 }, (_, i) =>
    makeNode(`d_l1_${i}`, 200, 60 + i * 80, `L1_${i+1}`, 'hidden', 'relu', Math.random()*0.4-0.2)
  ),
  ...Array.from({ length: 4 }, (_, i) =>
    makeNode(`d_l2_${i}`, 340, 60 + i * 80, `L2_${i+1}`, 'hidden', 'relu', Math.random()*0.4-0.2)
  ),
  ...Array.from({ length: 3 }, (_, i) =>
    makeNode(`d_l3_${i}`, 480, 100 + i * 80, `L3_${i+1}`, 'hidden', 'tanh', Math.random()*0.4-0.2)
  ),
  makeNode('d_o1', 620, 140, 'Out₁', 'output', 'sigmoid'),
  makeNode('d_o2', 620, 220, 'Out₂', 'output', 'sigmoid'),
];
const deepEdges = [
  ...['d_i1','d_i2'].flatMap(i => Array.from({length:4},(_,j)=>makeEdge(i,`d_l1_${j}`,Math.random()*2-1))),
  ...Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>makeEdge(`d_l1_${i}`,`d_l2_${j}`,Math.random()*2-1))).flat(),
  ...Array.from({length:4},(_,i)=>Array.from({length:3},(_,j)=>makeEdge(`d_l2_${i}`,`d_l3_${j}`,Math.random()*2-1))).flat(),
  ...Array.from({length:3},(_,i)=>[makeEdge(`d_l3_${i}`,'d_o1',Math.random()*2-1),makeEdge(`d_l3_${i}`,'d_o2',Math.random()*2-1)]).flat(),
];

// ── CNN-style ─────────────────────────────────────────────────
const cnnNodes = [
  makeNode('c_i1', 60, 60, 'Pixel₁', 'input', 'linear'),
  makeNode('c_i2', 60, 140, 'Pixel₂', 'input', 'linear'),
  makeNode('c_i3', 60, 220, 'Pixel₃', 'input', 'linear'),
  makeNode('c_i4', 60, 300, 'Pixel₄', 'input', 'linear'),
  makeNode('c_conv1', 230, 80, 'Conv₁', 'hidden', 'relu', 0.1),
  makeNode('c_conv2', 230, 180, 'Conv₂', 'hidden', 'relu', 0.1),
  makeNode('c_conv3', 230, 280, 'Conv₃', 'hidden', 'relu', 0.1),
  makeNode('c_pool1', 380, 130, 'Pool₁', 'hidden', 'relu'),
  makeNode('c_pool2', 380, 230, 'Pool₂', 'hidden', 'relu'),
  makeNode('c_fc1', 520, 130, 'FC₁', 'hidden', 'relu', 0.05),
  makeNode('c_fc2', 520, 230, 'FC₂', 'hidden', 'relu', -0.05),
  makeNode('c_o1', 660, 100, 'Cat', 'output', 'softmax'),
  makeNode('c_o2', 660, 180, 'Dog', 'output', 'softmax'),
  makeNode('c_o3', 660, 260, 'Bird', 'output', 'softmax'),
];
const cnnEdges = [
  makeEdge('c_i1','c_conv1',0.9), makeEdge('c_i2','c_conv1',0.7), makeEdge('c_i2','c_conv2',0.5),
  makeEdge('c_i3','c_conv2',0.8), makeEdge('c_i3','c_conv3',0.6), makeEdge('c_i4','c_conv3',0.9),
  makeEdge('c_conv1','c_pool1',1.0), makeEdge('c_conv2','c_pool1',0.8), makeEdge('c_conv2','c_pool2',0.7),
  makeEdge('c_conv3','c_pool2',1.0),
  makeEdge('c_pool1','c_fc1',0.9), makeEdge('c_pool1','c_fc2',0.6),
  makeEdge('c_pool2','c_fc1',0.7), makeEdge('c_pool2','c_fc2',0.8),
  makeEdge('c_fc1','c_o1',1.2), makeEdge('c_fc1','c_o2',0.8), makeEdge('c_fc1','c_o3',0.4),
  makeEdge('c_fc2','c_o1',0.3), makeEdge('c_fc2','c_o2',1.1), makeEdge('c_fc2','c_o3',0.9),
];

export const EXAMPLE_TEMPLATES: ExampleTemplate[] = [
  {
    id: 'xor',
    title: 'XOR Problem Network',
    description: 'Classic XOR problem solved with a 3-layer network. Shows how hidden layers enable non-linear decision boundaries.',
    tags: ['beginner', 'classification', 'xor'],
    difficulty: 'beginner',
    canvasState: {
      nodes: xorNodes as any,
      edges: xorEdges as any,
      viewport: defaultViewport,
      settings: defaultSettings,
      simulation: defaultSimulation,
      layers: [],
    },
  },
  {
    id: 'mlp',
    title: 'Multi-Layer Perceptron',
    description: 'A fully-connected feedforward network with two hidden layers. The standard building block for deep learning.',
    tags: ['intermediate', 'feedforward', 'dense'],
    difficulty: 'intermediate',
    canvasState: {
      nodes: mlpNodes as any,
      edges: mlpEdges as any,
      viewport: defaultViewport,
      settings: defaultSettings,
      simulation: defaultSimulation,
      layers: [],
    },
  },
  {
    id: 'binary-classifier',
    title: 'Simple Binary Classifier',
    description: 'A 2-input, 2-hidden, 1-output network for binary classification. Great starting point for beginners.',
    tags: ['beginner', 'classification', 'binary'],
    difficulty: 'beginner',
    canvasState: {
      nodes: binNodes as any,
      edges: binEdges as any,
      viewport: defaultViewport,
      settings: defaultSettings,
      simulation: defaultSimulation,
      layers: [],
    },
  },
  {
    id: 'backprop',
    title: 'Backpropagation Demo',
    description: 'Visualise forward and backward propagation. Understand how gradients flow through the network.',
    tags: ['intermediate', 'backprop', 'learning'],
    difficulty: 'intermediate',
    canvasState: {
      nodes: bpNodes as any,
      edges: bpEdges as any,
      viewport: defaultViewport,
      settings: defaultSettings,
      simulation: defaultSimulation,
      layers: [],
    },
  },
  {
    id: 'deep-layers',
    title: 'Deep Hidden Layers',
    description: 'A deep network with 3 hidden layers (4-4-3). Explore how depth affects representation power.',
    tags: ['advanced', 'deep', 'layers'],
    difficulty: 'advanced',
    canvasState: {
      nodes: deepNodes as any,
      edges: deepEdges as any,
      viewport: { x: 0, y: 0, zoom: 0.75 },
      settings: defaultSettings,
      simulation: defaultSimulation,
      layers: [],
    },
  },
  {
    id: 'cnn',
    title: 'Convolutional Network',
    description: 'A simplified CNN architecture showing convolution, pooling, and fully connected layers for image classification.',
    tags: ['advanced', 'cnn', 'vision'],
    difficulty: 'advanced',
    canvasState: {
      nodes: cnnNodes as any,
      edges: cnnEdges as any,
      viewport: { x: 0, y: 0, zoom: 0.8 },
      settings: defaultSettings,
      simulation: defaultSimulation,
      layers: [],
    },
  },
];
