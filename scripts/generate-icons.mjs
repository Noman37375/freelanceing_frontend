import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const paths = {
  // Tip: create this file for best results (a clean, high-res square logo)
  // This script will generate all required sizes from it.
  iconSource: path.join(projectRoot, "assets", "images", "icon-source.png"),
  icon: path.join(projectRoot, "assets", "images", "icon.png"),
  favicon: path.join(projectRoot, "assets", "images", "favicon.png"),
  pwaDir: path.join(projectRoot, "assets", "images", "pwa"),
};

const background = "#ffffff"; // change if you want a different background

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

function log(msg) {
  // eslint-disable-next-line no-console
  console.log(msg);
}

async function resizeContainSquare(buffer, size, outPath) {
  await sharp(buffer)
    .resize(size, size, { fit: "contain", background })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
}

async function makeMaskable(buffer, size, outPath) {
  // Put the logo inside a "safe zone" so OS/browser masking doesn't cut it.
  const inner = Math.floor(size * 0.8);
  const diff = size - inner;
  const padA = Math.floor(diff / 2);
  const padB = diff - padA;

  await sharp(buffer)
    .resize(inner, inner, { fit: "contain", background })
    .extend({
      top: padA,
      left: padA,
      bottom: padB,
      right: padB,
      background,
    })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
}

async function main() {
  const sourcePath = (await exists(paths.iconSource)) ? paths.iconSource : paths.icon;
  if (!(await exists(sourcePath))) {
    throw new Error(
      `Icon source not found. Expected either:\n- ${paths.iconSource}\n- ${paths.icon}`
    );
  }

  await ensureDir(paths.pwaDir);

  const sourceBuffer = await fs.readFile(sourcePath);
  const meta = await sharp(sourceBuffer).metadata();
  log(`Using source: ${path.relative(projectRoot, sourcePath)} (${meta.width}x${meta.height})`);

  // App icon (Expo uses this for native + for generating web assets during export)
  await resizeContainSquare(sourceBuffer, 1024, paths.icon);
  log(`Wrote: ${path.relative(projectRoot, paths.icon)} (1024x1024)`);

  // Favicon (browser tab) — keep it small and crisp
  await resizeContainSquare(sourceBuffer, 64, paths.favicon);
  log(`Wrote: ${path.relative(projectRoot, paths.favicon)} (64x64)`);

  // PWA icons (useful for custom manifest setups + future-proofing)
  const pwa192 = path.join(paths.pwaDir, "icon-192.png");
  const pwa512 = path.join(paths.pwaDir, "icon-512.png");
  const pwa192Mask = path.join(paths.pwaDir, "icon-192-maskable.png");
  const pwa512Mask = path.join(paths.pwaDir, "icon-512-maskable.png");

  await resizeContainSquare(sourceBuffer, 192, pwa192);
  await resizeContainSquare(sourceBuffer, 512, pwa512);
  await makeMaskable(sourceBuffer, 192, pwa192Mask);
  await makeMaskable(sourceBuffer, 512, pwa512Mask);

  log(`Wrote: ${path.relative(projectRoot, pwa192)} (192x192)`);
  log(`Wrote: ${path.relative(projectRoot, pwa512)} (512x512)`);
  log(`Wrote: ${path.relative(projectRoot, pwa192Mask)} (192x192 maskable-ish)`);
  log(`Wrote: ${path.relative(projectRoot, pwa512Mask)} (512x512 maskable-ish)`);

  log("Done.");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

