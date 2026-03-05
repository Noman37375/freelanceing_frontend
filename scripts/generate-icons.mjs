import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const paths = {
  iconSourceSvg:         path.join(projectRoot, "assets", "images", "icon-source.svg"),
  iconSourcePng:         path.join(projectRoot, "assets", "images", "icon-source.png"),
  icon:                  path.join(projectRoot, "assets", "images", "icon.png"),
  adaptiveIconSourceSvg: path.join(projectRoot, "assets", "images", "adaptive-icon-source.svg"),
  adaptiveIcon:          path.join(projectRoot, "assets", "images", "adaptive-icon.png"),
  splashSourceSvg:       path.join(projectRoot, "assets", "images", "splash-source.svg"),
  splash:                path.join(projectRoot, "assets", "images", "splash.png"),
  faviconSvg:            path.join(projectRoot, "assets", "images", "favicon.svg"),
  favicon:               path.join(projectRoot, "assets", "images", "favicon.png"),
  pwaDir:                path.join(projectRoot, "assets", "images", "pwa"),
};

const background = "#ffffff";

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
  await ensureDir(paths.pwaDir);

  // ── App icon ────────────────────────────────────────────────────────────────
  // Priority: icon-source.svg → icon-source.png → icon.png (fallback)
  if (await exists(paths.iconSourceSvg)) {
    const svgBuffer = await fs.readFile(paths.iconSourceSvg);
    // SVG already contains its own background — render at 1024×1024, no padding
    await sharp(svgBuffer, { density: 300 })
      .resize(1024, 1024)
      .png({ compressionLevel: 9 })
      .toFile(paths.icon);
    log(`Wrote: ${path.relative(projectRoot, paths.icon)} (1024x1024) [from icon-source.svg]`);
  } else {
    const sourcePath = (await exists(paths.iconSourcePng)) ? paths.iconSourcePng : paths.icon;
    if (!(await exists(sourcePath))) {
      throw new Error(`Icon source not found. Expected: ${paths.iconSourceSvg}, ${paths.iconSourcePng}, or ${paths.icon}`);
    }
    const sourceBuffer = await fs.readFile(sourcePath);
    const meta = await sharp(sourceBuffer).metadata();
    log(`Using source: ${path.relative(projectRoot, sourcePath)} (${meta.width}x${meta.height})`);
    await resizeContainSquare(sourceBuffer, 1024, paths.icon);
    log(`Wrote: ${path.relative(projectRoot, paths.icon)} (1024x1024)`);
  }

  // ── Splash screen ────────────────────────────────────────────────────────────
  if (await exists(paths.splashSourceSvg)) {
    const svgBuffer = await fs.readFile(paths.splashSourceSvg);
    await sharp(svgBuffer, { density: 300 })
      .resize(1024, 1024)
      .png({ compressionLevel: 9 })
      .toFile(paths.splash);
    log(`Wrote: ${path.relative(projectRoot, paths.splash)} (1024x1024) [from splash-source.svg]`);
  }

  // ── Android Adaptive Icon foreground ────────────────────────────────────────
  // Transparent background — OS applies backgroundColor from app.json
  if (await exists(paths.adaptiveIconSourceSvg)) {
    const svgBuffer = await fs.readFile(paths.adaptiveIconSourceSvg);
    await sharp(svgBuffer, { density: 300 })
      .resize(1024, 1024)
      .png({ compressionLevel: 9 })
      .toFile(paths.adaptiveIcon);
    log(`Wrote: ${path.relative(projectRoot, paths.adaptiveIcon)} (1024x1024) [from adaptive-icon-source.svg]`);
  }

  // Re-read icon.png for PWA icon generation
  const iconBuffer = await fs.readFile(paths.icon);

  // Favicon (browser tab) — use custom favicon.svg if present, otherwise fall back to icon source
  if (await exists(paths.faviconSvg)) {
    const svgBuffer = await fs.readFile(paths.faviconSvg);
    await sharp(svgBuffer, { density: 300 })
      .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(paths.favicon);
    log(`Wrote: ${path.relative(projectRoot, paths.favicon)} (192x192) [from favicon.svg]`);
  } else {
    await resizeContainSquare(iconBuffer, 192, paths.favicon);
    log(`Wrote: ${path.relative(projectRoot, paths.favicon)} (192x192)`);
  }

  // PWA icons (useful for custom manifest setups + future-proofing)
  const pwa192 = path.join(paths.pwaDir, "icon-192.png");
  const pwa512 = path.join(paths.pwaDir, "icon-512.png");
  const pwa192Mask = path.join(paths.pwaDir, "icon-192-maskable.png");
  const pwa512Mask = path.join(paths.pwaDir, "icon-512-maskable.png");

  await resizeContainSquare(iconBuffer, 192, pwa192);
  await resizeContainSquare(iconBuffer, 512, pwa512);
  await makeMaskable(iconBuffer, 192, pwa192Mask);
  await makeMaskable(iconBuffer, 512, pwa512Mask);

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

