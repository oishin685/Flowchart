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

- `npm run dev` は `localhost:5173` 固定で起動し、通常はブラウザを自動で開きます。
- 自動で開かない場合は手動で `http://localhost:5173/` を開いてください。
- 自動オープンしたくない場合は `npm run dev:no-open` を使ってください。
- 他端末から確認したい場合のみ `npm run dev:host` を使ってください。

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


## 画面が開かない/白画面のとき（根本確認の手順）

以下は「順番どおり」に実行してください。1つ飛ばすと原因を見落とします。

### 1) 実行場所を確認
```bash
cd ~/Flowchart
pwd
ls package.json
```
- `ls package.json` でファイル名が出ない場合、プロジェクト外で実行しています。

### 1.5) 版ズレを確認（doctor が無いとき）
```bash
npm run status
```
- `scripts:` に `doctor` が出ない場合、古いコミットを見ています。
- その場合は `git fetch --all --prune` → `git pull` を実行し、もう一度 `npm run status` を確認してください。

### 2) サーバーを起動（固定ポート）
```bash
npm run dev
```
このプロジェクトは `localhost:5173` 固定で起動します。ポートが埋まっている場合は起動に失敗し、エラーメッセージが表示されます。

### 3) 「起動できたか」を機械的に確認
別ターミナルを開いて次を実行:
```bash
lsof -nP -iTCP:5173 -sTCP:LISTEN
```
- `node ... TCP *:5173 (LISTEN)` のような行が出れば、Viteは起動しています。
- 何も出ない場合は、Viteは起動していません（= ブラウザ側の問題ではありません）。

### 4) ブラウザは `localhost` を使う
```text
http://localhost:5173/
```
- まず `localhost` で確認してください。
- `http://0.0.0.0:5173/` はブラウザで開かないでください（接続拒否になります）。
- `127.0.0.1` は環境によって接続拒否になることがあります。

### 5) 真っ白のときの確認
- `Shift + 再読み込み`（ハードリロード）
- シークレットウィンドウで `http://localhost:5173/` を開く
- それでもダメならブラウザのDevTools Consoleの赤いエラーを確認

### 6) 更新が反映されないとき
```bash
git pull
npm install
npm run dev
```
- 保存先はブラウザの `localStorage`（キー: `flowchart-builder-doc`）です。
- ブラウザが違うと（Chrome / Safari）保存内容は共有されません。

### 7) 自動チェック（おすすめ）
```bash
npm run doctor
```
- 実行場所・5173番ポート待受・開くURLをまとめて確認できます。
