#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${FLOWCHART_DIR:-$HOME/Flowchart}"

if [ ! -d "$ROOT_DIR" ]; then
  echo "❌ $ROOT_DIR が見つかりません。"
  echo "ℹ️  先に次を実行してください:"
  echo "   git clone https://github.com/oishin685/Flowchart.git \"$ROOT_DIR\""
  exit 1
fi

cd "$ROOT_DIR"

if [ ! -f package.json ]; then
  echo "❌ $ROOT_DIR に package.json がありません。"
  echo "ℹ️  リポジトリが壊れている可能性があります。再 clone を試してください。"
  exit 1
fi

echo "✅ 実行場所: $(pwd)"
echo "ℹ️  依存関係を確認します..."
npm install

echo "ℹ️  開発サーバーを起動します..."
echo "ℹ️  ブラウザURL: http://localhost:5173/"
exec npm run dev
