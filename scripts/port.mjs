import { execSync } from 'node:child_process';

const PORT = 5173;

try {
  const out = execSync(`lsof -nP -iTCP:${PORT} -sTCP:LISTEN`, { stdio: 'pipe' }).toString().trim();
  if (out) {
    console.log(`✅ Port ${PORT} is in use by:`);
    console.log(out);
  } else {
    console.log(`⚠️ Port ${PORT} has no listening process.`);
  }
} catch {
  console.log(`⚠️ Port ${PORT} has no listening process.`);
  console.log('Run `npm run dev` first, then re-run this check in another terminal.');
}
