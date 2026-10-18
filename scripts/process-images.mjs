// Prepares the architectural photographs used across the site.
// Needs sharp, which is not a project dependency: run `npm i --no-save sharp` first.
// Usage: npm run images -- <folder-of-source-jpgs>
// Sources are CC0 images from Wikimedia Commons (see public/images/CREDITS.md).
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = process.argv[2];
if (!SRC) {
  console.error('Pass the folder containing the downloaded source images.');
  process.exit(1);
}

// source file -> output basename
const MAP = {
  'c1.jpg': 'spiral-facade',
  'c2.jpg': 'angular-atrium',
  'c3.jpg': 'brutalist-tower',
  'c4.jpg': 'window-stack',
  'c5.jpg': 'concrete-corridor',
  'c7.jpg': 'concrete-monolith',
  'c8.jpg': 'stair-diagonal',
  'c9.jpg': 'angular-corner',
  'c10.jpg': 'balcony-grid',
  'c11.jpg': 'concrete-loggia',
  'c12.jpg': 'window-columns',
};

const OUT = path.resolve('public/images/arch');
await mkdir(OUT, { recursive: true });

for (const [file, name] of Object.entries(MAP)) {
  for (const width of [640, 1280]) {
    const info = await sharp(path.join(SRC, file))
      .resize({ width, withoutEnlargement: true })
      .grayscale()
      .linear(1.08, -6) // a touch more contrast, consistent across the set
      .webp({ quality: 70 })
      .toFile(path.join(OUT, `${name}-${width}.webp`));
    console.log(`${name}-${width}.webp`, `${info.width}x${info.height}`, `${(info.size / 1024).toFixed(0)}KB`);
  }
}
