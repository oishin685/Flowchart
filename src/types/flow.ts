import type { Edge, Node } from '@xyflow/react';

export type NodeKind = 'start' | 'end' | 'step' | 'condition' | 'switch' | 'note';
export type GroupOperator = 'AND' | 'OR';
export type ConditionOperator = '==' | '!=' | '>' | '>=' | '<' | '<=' | 'IN' | 'NOT_IN' | 'CONTAINS';

export interface ConditionRow {
  id: string;
  left: string;
  operator: ConditionOperator;
  right: string;
}

export interface SwitchCase {
  id: string;
  label: string;
  value: string;
}

export interface FlowNodeData {
  [key: string]: unknown;
  kind: NodeKind;
  label: string;
  description?: string;
  tags?: string[];
  actionType?: string;
  params?: Record<string, unknown>;
  conditionGroupOperator?: GroupOperator;
  conditions?: ConditionRow[];
  switchCases?: SwitchCase[];
}

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge;

export interface FlowMeta {
  name: string;
  version: string;
  updatedAt: string;
}

export interface FlowDocument {
  nodes: FlowNode[];
  edges: FlowEdge[];
  meta: FlowMeta;
  variablesSchema: string[];
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

export interface SimulationResult {
  visitedNodeIds: string[];
  logs: string[];
  completed: boolean;
  reason: string;
}
