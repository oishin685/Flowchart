import type { FlowDocument, ValidationResult } from '../types/flow';

export const validateFlow = (doc: FlowDocument): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const starts = doc.nodes.filter((n) => n.data.kind === 'start');
  if (starts.length === 0) errors.push('Startノードがありません。');
  if (starts.length > 1) warnings.push(`Startノードが${starts.length}個あります（推奨は1個）。`);

  const nodeMap = new Map(doc.nodes.map((n) => [n.id, n]));
  const outgoing = new Map<string, string[]>();
  for (const edge of doc.edges) {
    if (!outgoing.has(edge.source)) outgoing.set(edge.source, []);
    outgoing.get(edge.source)!.push(edge.target);
  }

  if (starts[0]) {
    const visited = new Set<string>();
    const stack = [starts[0].id];
    while (stack.length) {
      const id = stack.pop()!;
      if (visited.has(id)) continue;
      visited.add(id);
      for (const target of outgoing.get(id) ?? []) stack.push(target);
    }
    const unreachable = doc.nodes.filter((n) => !visited.has(n.id));
    if (unreachable.length) warnings.push(`到達不能ノード: ${unreachable.map((n) => n.data.label).join(', ')}`);
  }

  for (const node of doc.nodes) {
    if (node.data.kind === 'condition') {
      const branchLabels = (doc.edges.filter((e) => e.source === node.id).map((e) => String(e.label ?? '').toLowerCase()));
      if (!branchLabels.includes('true')) errors.push(`${node.data.label}: true分岐が未接続です。`);
      if (!branchLabels.includes('false')) errors.push(`${node.data.label}: false分岐が未接続です。`);
    }
  }

  const cycleWarn = detectCycle(doc, nodeMap);
  if (cycleWarn) warnings.push(cycleWarn);

  return { errors, warnings };
};

const detectCycle = (doc: FlowDocument, nodeMap: Map<string, unknown>): string | null => {
  const graph = new Map<string, string[]>();
  for (const node of nodeMap.keys()) graph.set(node, []);
  for (const edge of doc.edges) graph.get(edge.source)?.push(edge.target);

  const visited = new Set<string>();
  const rec = new Set<string>();

  const dfs = (node: string): boolean => {
    if (rec.has(node)) return true;
    if (visited.has(node)) return false;
    visited.add(node);
    rec.add(node);
    for (const n of graph.get(node) ?? []) if (dfs(n)) return true;
    rec.delete(node);
    return false;
  };

  for (const node of graph.keys()) if (dfs(node)) return 'ループを検出しました（許容されますが意図を確認してください）。';
  return null;
};
