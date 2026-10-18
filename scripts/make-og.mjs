// Builds public/og-image.jpg (1200×630) from the processed photographs.
// Needs sharp, which is not a project dependency: run `npm i --no-save sharp` first.
// Usage: npm run og
import sharp from 'sharp';

const W = 1200;
const H = 630;
const G = 10; // gutter

const photo = (name, w, h) =>
  sharp(`public/images/arch/${name}-640.webp`).resize(w, h, { fit: 'cover' }).toBuffer();

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

const colW = (W - 640 - G) / 2 - G / 2;
await sharp({ create: { width: W, height: H, channels: 3, background: '#0b0b0b' } })
  .composite([
    { input: word, left: G, top: G },
    { input: await photo('brutalist-tower', Math.round(colW), H - G * 2), left: 640, top: G },
    { input: await photo('window-columns', Math.round(colW), Math.round((H - G * 3) / 2)), left: Math.round(640 + colW + G), top: G },
    { input: await photo('stair-diagonal', Math.round(colW), Math.round((H - G * 3) / 2)), left: Math.round(640 + colW + G), top: Math.round(G * 2 + (H - G * 3) / 2) },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile('public/og-image.jpg');

console.log('public/og-image.jpg written');
