import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const root = path.resolve(import.meta.dirname, '..');
const src = path.join(root, 'assets', 'icon.svg');
const outDir = path.join(root, 'public');
mkdirSync(outDir, { recursive: true });

const svg = readFileSync(src, 'utf-8');

// Web manifest + favicon + apple-touch-icon all derive from one source.
const targets = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32.png' },
];

for (const { size, name } of targets) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  const png = resvg.render().asPng();
  writeFileSync(path.join(outDir, name), png);
  console.log(`  ${name}  ${size}x${size}`);
}
