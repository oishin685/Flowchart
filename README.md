# 汎用条件分岐フローチャートWebアプリ

このアプリは、**ノーコードで条件分岐フローチャートを作るためのWebアプリ**です。  
業務専用の言葉を使わず、いろいろな用途で再利用できる構成にしています。

---

## まず使いたい人へ

「開発者向け情報」より先に、**普通の使い方（取扱説明書）**を見たい方は次を開いてください。

- **[取扱説明書（日本語）](./取扱説明書.md)**

---

## 主な機能

- ノード編集（Start / End / Step / Condition / Switch / Note）
- 条件式編集（Left / Operator / Right、AND/OR）
- 保存・読込（localStorage）
- JSON / Markdown エクスポート
- シミュレーション（入力JSONで経路確認）
- バリデーション（到達不能・分岐未接続など）

---

## 開発環境で起動する

```bash
npm install
npm run dev
```

起動後、ターミナルに表示される `Local:` のURL（通常は `http://localhost:5173/`）をブラウザで開きます。

---

## 開発者向けコマンド

```bash
npm run check   # 型チェック
npm run lint    # ESLint
npm run build   # 本番ビルド
```

---

## 技術スタック

- TypeScript
- React
- React Flow
- Zustand
- Vite

