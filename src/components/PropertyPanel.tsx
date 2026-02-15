import { useMemo } from 'react';
import { useFlowStore } from '../flow/store';
import type { ConditionRow } from '../types/flow';

const operators = ['==', '!=', '>', '>=', '<', '<=', 'IN', 'NOT_IN', 'CONTAINS'];

export const PropertyPanel = () => {
  const { nodes, edges, selectedNodeId, selectedEdgeId, updateNodeData, updateEdgeLabel } = useFlowStore();
  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId), [nodes, selectedNodeId]);
  const selectedEdge = useMemo(() => edges.find((e) => e.id === selectedEdgeId), [edges, selectedEdgeId]);

  if (!selectedNode && !selectedEdge) return <section className="panel"><h3>プロパティ</h3><p>ノード/エッジを選択してください。</p></section>;
  if (selectedEdge) {
    return (
      <section className="panel">
        <h3>エッジ編集</h3>
        <label>ラベル</label>
        <input value={String(selectedEdge.label ?? '')} onChange={(e) => updateEdgeLabel(selectedEdge.id, e.target.value)} />
      </section>
    );
  }

  const data = selectedNode!.data;
  const conditions = data.conditions ?? [];

  const updateCondition = (id: string, patch: Partial<ConditionRow>) => {
    const next = conditions.map((row) => (row.id === id ? { ...row, ...patch } : row));
    updateNodeData(selectedNode!.id, { conditions: next });
  };

  return (
    <section className="panel">
      <h3>ノード編集</h3>
      <label>種類: {data.kind}</label>
      <label>表示名</label>
      <input value={data.label} onChange={(e) => updateNodeData(selectedNode!.id, { label: e.target.value })} />

      {(data.kind === 'step' || data.kind === 'note') && (
        <>
          <label>説明</label>
          <textarea value={data.description ?? ''} onChange={(e) => updateNodeData(selectedNode!.id, { description: e.target.value })} />
        </>
      )}

      {data.kind === 'condition' && (
        <>
          <label>グループ条件</label>
          <select value={data.conditionGroupOperator ?? 'AND'} onChange={(e) => updateNodeData(selectedNode!.id, { conditionGroupOperator: e.target.value as 'AND' | 'OR' })}>
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </select>
          <div className="stack">
            {conditions.map((row) => (
              <div className="cond-row" key={row.id}>
                <input placeholder="left path (例: user.age)" value={row.left} onChange={(e) => updateCondition(row.id, { left: e.target.value })} />
                <select value={row.operator} onChange={(e) => updateCondition(row.id, { operator: e.target.value as ConditionRow['operator'] })}>
                  {operators.map((op) => <option key={op} value={op}>{op}</option>)}
                </select>
                <input placeholder="right(JSON可)" value={row.right} onChange={(e) => updateCondition(row.id, { right: e.target.value })} />
              </div>
            ))}
            <button onClick={() => updateNodeData(selectedNode!.id, { conditions: [...conditions, { id: crypto.randomUUID(), left: '', operator: '==', right: '' }] })}>条件行を追加</button>
          </div>
        </>
      )}
    </section>
  );
};
