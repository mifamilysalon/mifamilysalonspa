/**
 * Watermark public illustrations with a small ConsultifyIT mark.
 *
 * Clean masters live in: backups/illustrations-clean/
 * Live (watermarked) copies: public/illustrations/
 *
 * Usage:
 *   node scripts/watermark-illustrations.mjs          # apply watermark from clean masters
 *   node scripts/watermark-illustrations.mjs --clean  # restore clean masters to public (after client payment)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const cleanDir = path.join(root, "backups", "illustrations-clean");
const publicDir = path.join(root, "public", "illustrations");

/** Client-owned / do-not-watermark masters (e.g. photo-based hero). */
const SKIP_WATERMARK = new Set(["hero.png"]);

const restoreClean = process.argv.includes("--clean");

function listCleanPngs() {
  return fs
    .readdirSync(cleanDir)
    .filter((f) => f.endsWith(".png") && !f.startsWith("_") && !f.includes("-previous"));
}

function watermarkSvg(width) {
  // Scale mark with image width; stays small (~10% of width, max 200px)
  const markW = Math.min(200, Math.max(110, Math.round(width * 0.1)));
  const markH = Math.round(markW * 0.22);
  const fontSize = Math.round(markH * 0.72);

  return Buffer.from(`
<svg width="${markW}" height="${markH}" xmlns="http://www.w3.org/2000/svg">
  <text x="50%" y="70%" text-anchor="middle"
    font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="${fontSize}" font-weight="600"
    fill="rgba(42,36,32,0.32)" letter-spacing="0.04em">ConsultifyIT</text>
</svg>`);
}

async function restore() {
  const files = listCleanPngs();
  for (const file of files) {
    fs.copyFileSync(path.join(cleanDir, file), path.join(publicDir, file));
    console.log(`restored clean: ${file}`);
  }
}

async function watermark() {
  const files = listCleanPngs();
  if (files.length === 0) {
    throw new Error(`No clean masters in ${cleanDir}`);
  }

  for (const file of files) {
    const input = path.join(cleanDir, file);
    const output = path.join(publicDir, file);

    if (SKIP_WATERMARK.has(file)) {
      fs.copyFileSync(input, output);
      console.log(`copied without watermark (client-owned): ${file}`);
      continue;
    }

    const meta = await sharp(input).metadata();
    const width = meta.width || 1200;
    const height = meta.height || 900;
    const svg = watermarkSvg(width);
    const markMeta = await sharp(svg).metadata();
    const markW = markMeta.width || 160;
    const markH = markMeta.height || 40;
    const margin = Math.max(12, Math.round(width * 0.018));

    await sharp(input)
      .composite([
        {
          input: svg,
          left: Math.max(0, width - markW - margin),
          top: Math.max(0, height - markH - margin),
        },
      ])
      .png({ compressionLevel: 8 })
      .toFile(output);

    console.log(`watermarked: ${file}`);
  }
}

if (restoreClean) {
  await restore();
} else {
  await watermark();
}
