// Prepares Riti's portrait for the About section.
// Needs sharp, which is not a project dependency: run `npm i --no-save sharp` first.
// Usage: npm run images
// Source: assets-src/riti-shah-portrait.png (supplied by Riti). The photo is only
// cropped to a 4:5 frame and re-encoded — no retouching, no upscaling. The grayscale
// treatment is applied in CSS so the original colour can be shown on hover.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = 'assets-src/riti-shah-portrait.png';
const OUT = 'public/images/portrait';
await mkdir(OUT, { recursive: true });

const { width, height } = await sharp(SRC).metadata();
const cropW = Math.round((height * 4) / 5);
const left = Math.max(0, Math.min(width - cropW, Math.round(width * 0.49 - cropW / 2)));

const info = await sharp(SRC)
  .extract({ left, top: 0, width: cropW, height })
  .flatten({ background: '#0b0b0b' })
  .webp({ quality: 88 })
  .toFile(`${OUT}/riti-shah.webp`);
console.log(`riti-shah.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)}KB`);
