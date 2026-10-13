import { existsSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Only copy public website files. Serverless function source, Stripe keys and
// repository configuration must never be published as static assets.
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const file of [
  'index.html', 'styles.css', 'script.js', 'robots.txt', '_headers',
  'payments.html', 'payment-success.html',
]) {
  const input = join(root, file);
  if (!existsSync(input)) throw new Error('Required public file missing: ' + file);
  cpSync(input, join(out, file));
}
const assets = join(root, 'assets');
if (!existsSync(assets)) throw new Error('Required public assets directory missing');
cpSync(assets, join(out, 'assets'), { recursive: true });
console.log('Prepared safe static site in dist/');
