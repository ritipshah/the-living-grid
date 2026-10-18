// Builds public/og-image.jpg (1200×630): wordmark + three technical frames.
// Needs sharp, which is not a project dependency: run `npm i --no-save sharp` first.
// Usage: npm run og
import sharp from 'sharp';
import { build } from 'vite';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Built inside node_modules so the bundle can resolve react-dom.
const out = path.resolve('node_modules/.cache/og-ssr');
await build({
  logLevel: 'silent',
  build: { ssr: 'scripts/og-entry.jsx', outDir: out, emptyOutDir: true },
});
const { frameSvg } = await import(pathToFileURL(path.join(out, 'og-entry.js')).href);

const W = 1200;
const H = 630;
const G = 10;

const word = Buffer.from(`
<svg width="${640 - G * 2}" height="${H - G * 2}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#ece8e1"/>
  <text x="34" y="64" font-family="Menlo, monospace" font-size="20" letter-spacing="2" fill="#4a4741">PORTFOLIO · DATA SCIENCE · NMIMS MUMBAI</text>
  <text transform="translate(30 300) scale(0.66 1)" font-family="Helvetica Neue, Arial, sans-serif" font-weight="900" font-size="230" fill="#0b0b0b">RITI</text>
  <rect x="150" y="345" width="30" height="30" fill="#e8590c"/>
  <text transform="translate(200 480) scale(0.66 1)" font-family="Helvetica Neue, Arial, sans-serif" font-weight="900" font-size="230" fill="#0b0b0b">SHAH</text>
  <line x1="34" x2="586" y1="530" y2="530" stroke="#bdb7ad"/>
  <text x="34" y="570" font-family="Georgia, serif" font-style="italic" font-size="30" fill="#b84204">The Living Grid</text>
</svg>`);

const colW = Math.round((W - 640 - G) / 2 - G / 2);
const halfH = Math.round((H - G * 3) / 2);
const frame = (name, w, h) => sharp(Buffer.from(frameSvg(name, w, h))).png().toBuffer();

await sharp({ create: { width: W, height: H, channels: 3, background: '#0b0b0b' } })
  .composite([
    { input: word, left: G, top: G },
    { input: await frame('graph', colW, H - G * 2), left: 640, top: G },
    { input: await frame('gas', colW, halfH), left: 640 + colW + G, top: G },
    { input: await frame('samples', colW, halfH), left: 640 + colW + G, top: G * 2 + halfH },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile('public/og-image.jpg');

await rm(out, { recursive: true, force: true });
console.log('public/og-image.jpg written');
