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

- `npm run dev` は `vite --open` で起動し、通常はブラウザを自動で開きます。
- 自動で開かない場合は手動で `http://localhost:5173/` を開いてください。
- 自動オープンしたくない場合は `npm run dev:no-open` を使ってください。

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


## 画面が開かない/白画面のとき（手順をそのまま実行）

### 0) まず「正しい場所」で実行できているか確認
```bash
cd ~/Flowchart
pwd
ls package.json
```
- `ls package.json` で `package.json` が表示されない場合は、まだプロジェクトの外にいます。

### 1) サーバーを起動
```bash
npm run dev
```
このログが出たら起動成功です（数字は変わることがあります）。
```text
VITE ... ready
Local: http://localhost:5173/
```

### 2) 画面を開く（自動で開かなかったとき）
```bash
open http://localhost:5173/
```
それでもダメなら:
```bash
open http://127.0.0.1:5173/
```

### 3) ここが重要（よくあるつまずき）
- `npm run dev` 実行後のターミナルは**サーバー専用**です。
- そのまま `cd` や `npm install` を打っても、期待通り動かないことがあります。
- 別コマンドを打ちたいときは `Ctrl + C` で止めるか、**ターミナルをもう1つ開く**。

### 4) 画面が正しく開いたか確認する目印
画面に次が見えれば成功です。
- タイトル: `汎用フローチャートビルダー`
- 青い情報欄: `実行中URL: ... / 保存先: localStorage（キー: flowchart-builder-doc）`

### 5) 保存先はどこ？
- 保存先はファイルではなく、このブラウザの `localStorage` です。
- キー名は `flowchart-builder-doc` です。
- 同じPCでも、Chrome と Safari などブラウザが違うと保存は共有されません。

### 6) 反映されないとき（超重要）
- まず最新版を取得してください。
```bash
git pull
npm install
npm run dev
```
- 画面が白いままでも、今後はエラー時に赤いエラーパネルを表示します。
- ブラウザのURLが `localhost:5173` になっているか再確認してください。


### 7) あなたのスクショの状態から、そのまま確認する手順
前提: 右のターミナルに `VITE ... ready` が出ていて、左のブラウザが白い状態。

1. **右のターミナルは触らない**（そのまま起動させておく）
   - ここを閉じるとサーバーが止まります。

2. 左のブラウザで `Shift + 再読み込み`（ハードリロード）を1回実行
   - 変化がなければ次へ。

3. 左のブラウザのURL欄をクリックして、次をそのまま入力して Enter
   ```text
   http://127.0.0.1:5173/
   ```
   - `localhost` でダメな環境でも `127.0.0.1` なら表示できる場合があります。

4. まだ白い場合、ブラウザのシークレットウィンドウで同じURLを開く
   ```text
   http://127.0.0.1:5173/
   ```
   - 拡張機能やキャッシュの影響を切り分けます。

5. それでも白い場合、**新しいターミナルをもう1つ開いて**次を実行
   ```bash
   cd ~/Flowchart
   git pull
   npm install
   npm run dev
   ```
   - 既存ターミナルは `Ctrl + C` で止めてからでOKです。

6. 表示確認（合格ライン）
   - `汎用フローチャートビルダー` が見える
   - 青い情報欄（実行中URL / 保存先）が見える
   - これが見えたら動作確認完了です。

7. もし赤いエラーパネルが出たら
   - 白画面ではなく、原因表示まで来ています（前進です）。
   - 赤い枠内メッセージをそのままコピーして共有してください。
