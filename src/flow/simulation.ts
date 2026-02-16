import type { FlowDocument, FlowEdge, FlowNode, GroupOperator, SimulationResult } from '../types/flow';

const getByPath = (obj: unknown, path: string): unknown => {
  if (!path) return undefined;
  return path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], obj);
};

const parseRight = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

const evalCondition = (left: unknown, op: string, right: unknown): boolean => {
  switch (op) {
    case '==': return left == right;
    case '!=': return left != right;
    case '>': return Number(left) > Number(right);
    case '>=': return Number(left) >= Number(right);
    case '<': return Number(left) < Number(right);
    case '<=': return Number(left) <= Number(right);
    case 'IN': return Array.isArray(right) && right.includes(left);
    case 'NOT_IN': return Array.isArray(right) && !right.includes(left);
    case 'CONTAINS':
      if (Array.isArray(left)) return left.includes(right);
      if (typeof left === 'string') return left.includes(String(right));
      return false;
    default: return false;
  }
};

const pickEdge = (node: FlowNode, edges: FlowEdge[], variables: Record<string, unknown>, logs: string[]): FlowEdge | null => {
  const outgoing = edges.filter((e) => e.source === node.id);
  if (!outgoing.length) return null;

  if (node.data.kind === 'condition') {
    const rows = node.data.conditions ?? [];
    const mode: GroupOperator = node.data.conditionGroupOperator ?? 'AND';
    const result = mode === 'AND'
      ? rows.every((r) => evalCondition(getByPath(variables, r.left), r.operator, parseRight(r.right)))
      : rows.some((r) => evalCondition(getByPath(variables, r.left), r.operator, parseRight(r.right)));
    logs.push(`条件評価 ${node.data.label}: ${result}`);
    return outgoing.find((e) => String(e.label).toLowerCase() === String(result).toLowerCase()) ?? null;
  }

  if (node.data.kind === 'switch') {
    const input = getByPath(variables, node.data.description ?? '');
    const matched = outgoing.find((e) => String(e.label) === String(input));
    return matched ?? outgoing.find((e) => String(e.label).toLowerCase() === 'default') ?? null;
  }

  return outgoing[0];
};

export const simulateFlow = (doc: FlowDocument, variables: Record<string, unknown>): SimulationResult => {
  const logs: string[] = [];
  const visitedNodeIds: string[] = [];
  const starts = doc.nodes.filter((n) => n.data.kind === 'start');
  if (!starts.length) return { visitedNodeIds, logs, completed: false, reason: 'Startノードがありません。' };

  let current: FlowNode | undefined = starts[0];
  const nodeMap = new Map(doc.nodes.map((n) => [n.id, n]));
  const stepsLimit = 200;

  for (let i = 0; i < stepsLimit && current; i++) {
    visitedNodeIds.push(current.id);
    logs.push(`ノード通過: [${current.data.kind}] ${current.data.label}`);
    if (current.data.kind === 'end') return { visitedNodeIds, logs, completed: true, reason: 'Endノードに到達しました。' };

    const nextEdge = pickEdge(current, doc.edges, variables, logs);
    if (!nextEdge) return { visitedNodeIds, logs, completed: false, reason: `${current.data.label} から遷移できません。` };
    current = nodeMap.get(nextEdge.target);
  }

  return { visitedNodeIds, logs, completed: false, reason: '最大ステップ数を超過しました（ループの可能性）。' };
};
