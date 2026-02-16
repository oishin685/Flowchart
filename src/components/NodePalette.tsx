import type { NodeKind } from '../types/flow';

const kinds: { kind: NodeKind; label: string }[] = [
  { kind: 'start', label: '開始' },
  { kind: 'end', label: '終了' },
  { kind: 'step', label: 'ステップ' },
  { kind: 'condition', label: '条件分岐' },
  { kind: 'switch', label: 'Switch' },
  { kind: 'note', label: 'メモ' },
];

export const NodePalette = ({ onAdd }: { onAdd: (kind: NodeKind) => void }) => (
  <section className="panel">
    <h3>ノード追加</h3>
    <div className="stack">
      {kinds.map((item) => (
        <button key={item.kind} onClick={() => onAdd(item.kind)}>{item.label}</button>
      ))}
    </div>
  </section>
);
