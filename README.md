# 汎用条件分岐フローチャートWebアプリ

ノーコードで条件分岐フローを作成・保存・共有するためのフロントエンドアプリです。業務特化の語彙を避け、汎用フローチャートとして再利用しやすい構成にしています。

## 概要

- React Flow による GUI キャンバス編集
- ノード: Start / End / Step / Condition / Switch / Note
- 条件行（Left / Operator / Right）と AND/OR 条件グループ編集
- localStorage 保存/読込
- JSON / Markdown エクスポート（AI連携向け）
- クリップボードコピー（JSON / Markdown / AIプロンプト）
- バリデーション（Start, 到達不能, 条件分岐の接続, ループ警告）
- シミュレーション（variables JSON を入力して Start から評価遷移）

## インストール手順

```bash
npm install
npm run dev
```

- `npm run dev` で開発サーバーを起動できます。
- ブラウザで **Vite が表示した Local URL** を開いてください（通常は `http://localhost:5173/`）。
- もし `Port 5173 is in use` が出たら、先に 5173 を使っているプロセスを止めてから再実行してください。

ビルド:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## 使い方

1. 左パネルのノード追加ボタンでノードを追加
2. キャンバス上でノード同士を接続（Condition の分岐は自動で true/false ラベル付与）
3. 右パネルで選択ノードの表示名や条件式を編集
4. 上部バーで保存・読込・インポートを実行
5. 上部 `Export` メニューで次を実行
   - Download JSON
   - Download Markdown
   - Copy Markdown
   - Copy JSON（サイズが大きい場合は確認ダイアログ）
   - Generate AI Prompt（「変更したい点」を埋め込んだ依頼文をコピー）
6. `入力JSON` に variables を書いて「シミュレーション」実行
7. 画面下部ログで通過ノードや停止理由、検証結果を確認

### キーボード操作

- `Delete`: 選択中ノード/エッジ削除
- `Ctrl+S` (`Cmd+S`): localStorage に保存

## JSONフォーマット例（flow.json）

```json
{
  "meta": {
    "name": "サンプル: 金額条件フロー",
    "version": "1.0.0",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  "variablesSchema": ["amount"],
  "nodes": [
    {
      "id": "condition-1",
      "type": "default",
      "position": { "x": 320, "y": 220 },
      "data": {
        "kind": "condition",
        "label": "金額判定",
        "conditionGroupOperator": "AND",
        "conditions": [
          { "id": "c1", "left": "amount", "operator": ">=", "right": "1000" }
        ]
      }
    }
  ],
  "edges": [
    { "id": "e2", "source": "condition-1", "target": "step-1", "label": "true" },
    { "id": "e3", "source": "condition-1", "target": "step-2", "label": "false" }
  ]
}
```

## Markdownフォーマット例（flow.md）

`Flow Summary / Nodes / Edges / Entry Points / Execution Notes (optional)` の固定章立てで出力します。Conditionノードは `Condition Details` に条件グループと条件行を完全展開します。

## 将来の拡張案

- 共有リンク発行（バックエンド同期）
- ユーザー権限・同時編集
- ノードテンプレート配布
- 条件式の型補完（variablesSchema と連携）
- 実行エンジンのサーバー化


## 開発時の最小手順

```bash
cd ~/Flowchart
npm install
npm run dev
```

- ブラウザで `http://localhost:5173/` を開いてください。
- `npm run dev` 実行中のターミナルはサーバー用なので、別コマンドは別ターミナルで実行してください。


### 5173ポートが使用中のとき

```bash
lsof -nP -iTCP:5173 -sTCP:LISTEN
kill -9 <PID>
npm run dev
```

- `<PID>` には `lsof` で表示された番号を入れてください。
- その後、ターミナルに表示された `Local:` のURLをブラウザで開いてください。
