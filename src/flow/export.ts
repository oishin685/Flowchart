import type { FlowDocument, FlowEdge, FlowNode } from '../types/flow';
import { validateFlow } from './validation';

const compareText = (a: string, b: string): number => a.localeCompare(b, 'ja');

const sortedNodes = (nodes: FlowNode[]): FlowNode[] => (
  [...nodes].sort((a, b) => {
    const t = compareText(a.data.kind, b.data.kind);
    if (t !== 0) return t;
    const l = compareText(a.data.label, b.data.label);
    if (l !== 0) return l;
    return compareText(a.id, b.id);
  })
);

const sortedEdges = (edges: FlowEdge[]): FlowEdge[] => (
  [...edges].sort((a, b) => {
    const s = compareText(a.source, b.source);
    if (s !== 0) return s;
    const t = compareText(a.target, b.target);
    if (t !== 0) return t;
    return compareText(String(a.label ?? ''), String(b.label ?? ''));
  })
);

const esc = (txt: unknown): string => String(txt ?? '').replace(/\|/g, '\\|').replace(/\n/g, '<br/>');

const formatNodeMajorData = (node: FlowNode): string => {
  const data = node.data;
  if (data.kind === 'condition') {
    const rows = data.conditions ?? [];
    const expanded = rows
      .map((r, i) => `${i + 1}. ${r.left || '(empty)'} ${r.operator} ${r.right || '(empty)'}`)
      .join(' / ');
    return `group=${data.conditionGroupOperator ?? 'AND'}; rows=${expanded || '(none)'}`;
  }

  if (data.kind === 'step') {
    return `actionType=${data.actionType ?? '(none)'}; tags=${(data.tags ?? []).join(',') || '(none)'}`;
  }

  if (data.kind === 'switch') {
    const cases = data.switchCases?.map((c) => `${c.label}:${c.value}`).join(', ') ?? '(none)';
    return `cases=${cases}`;
  }

  if (data.kind === 'note') {
    return `note=${data.description ?? '(none)'}`;
  }

  return '-';
};

export const toStableJson = (doc: FlowDocument): string => {
  const normalized: FlowDocument = {
    ...doc,
    nodes: sortedNodes(doc.nodes),
    edges: sortedEdges(doc.edges),
  };

  return JSON.stringify(normalized, null, 2);
};

export const toFlowMarkdown = (doc: FlowDocument): string => {
  const nodes = sortedNodes(doc.nodes);
  const edges = sortedEdges(doc.edges);
  const starts = nodes.filter((n) => n.data.kind === 'start');
  const validation = validateFlow({ ...doc, nodes, edges });

  const lines: string[] = [];
  lines.push('# flow.md');
  lines.push('');
  lines.push('## Flow Summary');
  lines.push(`- フロー名: ${doc.meta.name}`);
  lines.push(`- 更新日時: ${doc.meta.updatedAt}`);
  lines.push(`- ノード数: ${nodes.length}`);
  lines.push(`- エッジ数: ${edges.length}`);
  lines.push('');

  lines.push('## Nodes');
  lines.push('| id | type | label | 主要data |');
  lines.push('|---|---|---|---|');
  for (const node of nodes) {
    lines.push(`| ${esc(node.id)} | ${esc(node.data.kind)} | ${esc(node.data.label)} | ${esc(formatNodeMajorData(node))} |`);
  }
  lines.push('');

  const conditionNodes = nodes.filter((n) => n.data.kind === 'condition');
  if (conditionNodes.length > 0) {
    lines.push('### Condition Details');
    for (const node of conditionNodes) {
      lines.push(`- ${node.data.label} (${node.id})`);
      lines.push(`  - 条件グループ: ${node.data.conditionGroupOperator ?? 'AND'}`);
      const rows = node.data.conditions ?? [];
      if (rows.length === 0) {
        lines.push('  - 条件行: (none)');
      } else {
        rows.forEach((row, index) => {
          lines.push(`  - 条件行${index + 1}: Left=${row.left || '(empty)'}, Op=${row.operator}, Right=${row.right || '(empty)'}`);
        });
      }
    }
    lines.push('');
  }

  lines.push('## Edges');
  lines.push('| source → target | label | sourceHandle |');
  lines.push('|---|---|---|');
  for (const edge of edges) {
    lines.push(`| ${esc(`${edge.source} → ${edge.target}`)} | ${esc(edge.label ?? '')} | ${esc(edge.sourceHandle ?? '')} |`);
  }
  lines.push('');

  lines.push('## Entry Points');
  if (starts.length === 0) {
    lines.push('- (none)');
  } else {
    starts.forEach((s) => lines.push(`- ${s.id} (${s.data.label})`));
  }
  lines.push('');

  lines.push('## Execution Notes (optional)');
  if (validation.errors.length === 0 && validation.warnings.length === 0) {
    lines.push('- (none)');
  } else {
    validation.errors.forEach((e) => lines.push(`- ERROR: ${e}`));
    validation.warnings.forEach((w) => lines.push(`- WARNING: ${w}`));
  }
  lines.push('');

  return lines.join('\n');
};

export const generateAiPrompt = (doc: FlowDocument, requestedChanges: string): string => {
  const md = toFlowMarkdown(doc);
  return [
    '# AIへの修正依頼テンプレート',
    '',
    'あなたはフローチャート仕様の改善アシスタントです。以下の情報を読み、破壊的変更を避けつつ改善案を提案してください。',
    '',
    '## 目的',
    '- 汎用の条件分岐フローを保守しやすく改善する。',
    '- 既存ノードID/エッジ接続の互換性に配慮する。',
    '',
    '## 現状フロー',
    md,
    '',
    '## 変更したい点',
    requestedChanges || '- (未入力)',
    '',
    '## 出力してほしい形式',
    '1. 変更方針（箇条書き）',
    '2. 変更後のflow.json（完全版）',
    '3. 変更差分の要約（Markdown）',
  ].join('\n');
};
