import { execSync } from 'node:child_process';
import fs from 'node:fs';

const read = (cmd) => {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString().trim();
  } catch {
    return 'N/A';
  }
};

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

console.log('=== Flowchart 状態確認 ===');
console.log(`name: ${pkg.name}`);
console.log(`version: ${pkg.version}`);
console.log(`branch: ${read('git branch --show-current')}`);
console.log(`commit: ${read('git rev-parse --short HEAD')}`);
console.log(`remote: ${read('git remote get-url origin')}`);
console.log('scripts:');
Object.keys(pkg.scripts).forEach((name) => console.log(`  - ${name}`));
console.log('\n期待する主要スクリプト: dev / dev:no-open / dev:host / doctor');
