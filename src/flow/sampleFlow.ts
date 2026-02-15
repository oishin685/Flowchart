import type { FlowDocument } from '../types/flow';

export const SAMPLE_FLOW: FlowDocument = {
  meta: {
    name: 'サンプル: 金額条件フロー',
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
  },
  variablesSchema: ['amount'],
  nodes: [
    { id: 'start-1', type: 'default', position: { x: 80, y: 220 }, data: { kind: 'start', label: '開始' } },
    {
      id: 'condition-1',
      type: 'default',
      position: { x: 320, y: 220 },
      data: {
        kind: 'condition',
        label: '金額判定',
        conditionGroupOperator: 'AND',
        conditions: [{ id: 'c1', left: 'amount', operator: '>=', right: '1000' }],
      },
    },
    {
      id: 'step-1',
      type: 'default',
      position: { x: 580, y: 140 },
      data: { kind: 'step', label: '高額処理', tags: ['high'], actionType: 'log', params: { level: 'high' } },
    },
    {
      id: 'step-2',
      type: 'default',
      position: { x: 580, y: 300 },
      data: { kind: 'step', label: '通常処理', tags: ['normal'], actionType: 'log', params: { level: 'normal' } },
    },
    { id: 'end-1', type: 'default', position: { x: 840, y: 220 }, data: { kind: 'end', label: '終了' } },
  ],
  edges: [
    { id: 'e1', source: 'start-1', target: 'condition-1' },
    { id: 'e2', source: 'condition-1', target: 'step-1', label: 'true' },
    { id: 'e3', source: 'condition-1', target: 'step-2', label: 'false' },
    { id: 'e4', source: 'step-1', target: 'end-1' },
    { id: 'e5', source: 'step-2', target: 'end-1' },
  ],
};
