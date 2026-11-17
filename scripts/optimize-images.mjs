// Convierte las fotos fuente (source/fotos/*.jpg) a WebP en varios anchos
// y genera public/img/manifest.json con dimensiones para width/height en el HTML.
// Uso: npm run images  (solo se corre cuando cambian las fotos)
import sharp from 'sharp';
import { readdir, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'source/fotos';
const OUT = 'public/img';
const WIDTHS = [400, 800, 1200];
await mkdir(OUT, { recursive: true });

const manifest = {};
for (const file of (await readdir(SRC)).filter(f => /\.jpe?g$/i.test(f))) {
  const name = path.parse(file).name;
  const img = sharp(path.join(SRC, file));
  const { width, height } = await img.metadata();
  // Anchos menores al original + el original (nunca se escala hacia arriba)
  const widths = [...new Set([...WIDTHS.filter(w => w < width - 80), width])];
  for (const w of widths) {
    await sharp(path.join(SRC, file))
      .resize({ width: w })
      .webp({ quality: 78, effort: 6 })
      .toFile(path.join(OUT, `${name}-${w}.webp`));
  }
  manifest[name] = { width, height, widths };
}
await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`OK: ${Object.keys(manifest).length} imágenes`);
