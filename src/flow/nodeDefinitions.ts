import type { NodeKind } from '../types/flow';

export const NODE_DEFINITIONS: Record<NodeKind, { title: string; description: string }> = {
  start: { title: 'Start', description: 'フローの開始点' },
  end: { title: 'End', description: 'フローの終了点' },
  step: { title: 'Step', description: '処理ノード（実行せずログのみ）' },
  condition: { title: 'Condition', description: '条件式を評価して分岐' },
  switch: { title: 'Switch', description: '値ごとにケース分岐' },
  note: { title: 'Note', description: 'フローに影響しない注釈' },
};
