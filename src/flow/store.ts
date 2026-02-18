import { addEdge, applyEdgeChanges, applyNodeChanges, type Connection, type EdgeChange, type NodeChange } from '@xyflow/react';
import { create } from 'zustand';
import { SAMPLE_FLOW } from './sampleFlow';
import type { FlowDocument, FlowEdge, FlowNode, FlowNodeData } from '../types/flow';

interface HistorySnapshot {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface FlowState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  meta: FlowDocument['meta'];
  variablesSchema: string[];
  selectedNodeId?: string;
  selectedEdgeId?: string;
  logs: string[];
  history: HistorySnapshot[];
  future: HistorySnapshot[];
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (kind: FlowNodeData['kind']) => void;
  updateNodeData: (id: string, patch: Partial<FlowNodeData>) => void;
  removeSelected: () => void;
  setSelection: (selectedNodeId?: string, selectedEdgeId?: string) => void;
  updateEdgeLabel: (id: string, label: string) => void;
  setLogs: (logs: string[]) => void;
  setFlow: (doc: FlowDocument) => void;
  toDocument: () => FlowDocument;
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
  newFlow: () => void;
}

const mkNode = (kind: FlowNodeData['kind'], idx: number): FlowNode => ({
  id: `${kind}-${crypto.randomUUID().slice(0, 8)}`,
  type: 'default',
  position: { x: 200 + idx * 20, y: 100 + idx * 20 },
  data: {
    kind,
    label: {
      start: '開始', end: '終了', step: 'ステップ', condition: '条件', switch: '分岐', note: 'メモ',
    }[kind],
    conditionGroupOperator: 'AND',
    conditions: kind === 'condition' ? [{ id: crypto.randomUUID(), left: '', operator: '==', right: '' }] : undefined,
  },
});

export const useFlowStore = create<FlowState>((set, get) => ({
  ...SAMPLE_FLOW,
  logs: ['サンプルフローを読み込みました。'],
  history: [],
  future: [],
  saveHistory: () => set((s) => ({ history: [...s.history, { nodes: s.nodes, edges: s.edges }].slice(-50), future: [] })),
  onNodesChange: (changes) => set((s) => ({ nodes: applyNodeChanges<FlowNode>(changes, s.nodes) })),
  onEdgesChange: (changes) => set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),
  onConnect: (connection) => {
    get().saveHistory();
    const sourceNode = get().nodes.find((n) => n.id === connection.source);
    const existing = get().edges.filter((e) => e.source === connection.source);
    const label = sourceNode?.data.kind === 'condition' ? (existing.length === 0 ? 'true' : existing.length === 1 ? 'false' : `branch-${existing.length + 1}`) : undefined;
    set((s) => ({ edges: addEdge({ ...connection, label }, s.edges) }));
  },
  addNode: (kind) => {
    get().saveHistory();
    set((s) => ({ nodes: [...s.nodes, mkNode(kind, s.nodes.length)] }));
  },
  updateNodeData: (id, patch) => {
    set((s) => ({ nodes: s.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)) }));
  },
  removeSelected: () => {
    const { selectedNodeId, selectedEdgeId } = get();
    if (!selectedNodeId && !selectedEdgeId) return;
    get().saveHistory();
    set((s) => ({
      nodes: selectedNodeId ? s.nodes.filter((n) => n.id !== selectedNodeId) : s.nodes,
      edges: s.edges.filter((e) => e.id !== selectedEdgeId && e.source !== selectedNodeId && e.target !== selectedNodeId),
      selectedEdgeId: undefined,
      selectedNodeId: undefined,
        }));
  },
  setSelection: (selectedNodeId, selectedEdgeId) => set((state) => {
    if (state.selectedNodeId === selectedNodeId && state.selectedEdgeId === selectedEdgeId) {
      return state;
    }

    return {
      selectedNodeId,
      selectedEdgeId,
    };
  }),
  updateEdgeLabel: (id, label) => set((s) => ({ edges: s.edges.map((e) => (e.id === id ? { ...e, label } : e)) })),
  setLogs: (logs) => set({ logs }),
  setFlow: (doc) => set({
    ...doc,
    selectedNodeId: undefined,
    selectedEdgeId: undefined,
      logs: ['フローを読み込みました。'],
    history: [],
    future: [],
  }),
  toDocument: () => {
    const s = get();
    return { nodes: s.nodes, edges: s.edges, meta: { ...s.meta, updatedAt: new Date().toISOString() }, variablesSchema: s.variablesSchema };
  },
  undo: () => {
    const s = get();
    const last = s.history[s.history.length - 1];
    if (!last) return;
    set({ nodes: last.nodes, edges: last.edges, history: s.history.slice(0, -1), future: [{ nodes: s.nodes, edges: s.edges }, ...s.future] });
  },
  redo: () => {
    const s = get();
    const next = s.future[0];
    if (!next) return;
    set({ nodes: next.nodes, edges: next.edges, history: [...s.history, { nodes: s.nodes, edges: s.edges }], future: s.future.slice(1) });
  },
  newFlow: () => set({
    ...SAMPLE_FLOW,
    selectedNodeId: undefined,
    selectedEdgeId: undefined,
      logs: ['新規作成: サンプルから開始'],
    history: [],
    future: [],
  }),
}));
