import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const cwd = process.cwd();
const pkgPath = path.join(cwd, 'package.json');

const ok = (msg) => console.log(`✅ ${msg}`);
const ng = (msg) => console.log(`❌ ${msg}`);
const info = (msg) => console.log(`ℹ️  ${msg}`);

console.log('=== Flowchart 起動チェック (doctor) ===');
info(`現在地: ${cwd}`);

if (!fs.existsSync(pkgPath)) {
  ng('この場所に package.json がありません。');
  info('まず次を実行: cd ~/Flowchart');
  process.exit(1);
}
ok('package.json を確認しました。');

try {
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'pipe' });
  ok('Git リポジトリ内です。');
} catch {
  ng('Git リポジトリ内ではありません。');
}

try {
  const out = execSync('lsof -nP -iTCP:5173 -sTCP:LISTEN', { stdio: 'pipe' }).toString().trim();
  if (out) {
    ok('5173番ポートで待受中のプロセスがあります。');
    console.log(out);
  } else {
    ng('5173番ポートの待受プロセスは見つかりません。');
  }
} catch {
  ng('5173番ポートの待受プロセスは見つかりません。');
  info('別ターミナルで npm run dev を起動してください。');
}

console.log('\n--- 重要 ---');
info('ブラウザで開くURLは http://localhost:5173/ です。');
info('http://0.0.0.0:5173/ は開かないでください（ブラウザ向けURLではありません）。');
