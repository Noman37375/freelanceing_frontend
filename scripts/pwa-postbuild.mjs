import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

const srcIconsDir = path.join(projectRoot, "assets", "images", "pwa");
const distIconsDir = path.join(distDir, "icons");

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

async function readJson(p) {
  return JSON.parse(await fs.readFile(p, "utf8"));
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

async function writeFile(p, content) {
  await ensureDir(path.dirname(p));
  await fs.writeFile(p, content);
}

async function injectOnce(html, marker, injection) {
  if (html.includes(injection.trim())) return html;
  const idx = html.indexOf(marker);
  if (idx === -1) return html;
  return html.slice(0, idx) + injection + html.slice(idx);
}

async function main() {
  if (!(await exists(distDir))) {
    throw new Error(
      `Missing dist folder. Run \"npm run build:web\" first. Expected: ${distDir}`
    );
  }

  const appJsonPath = path.join(projectRoot, "app.json");
  const app = (await exists(appJsonPath)) ? await readJson(appJsonPath) : null;
  const expo = app?.expo ?? {};

  const name = expo.name ?? "App";
  const shortName = (expo.name ?? "App").slice(0, 12);
  const themeColor = "#ffffff";
  const backgroundColor = "#ffffff";

  await ensureDir(distIconsDir);

  // Copy PWA icons into dist so manifest can reference them
  const iconFiles = [
    "icon-192.png",
    "icon-512.png",
    "icon-192-maskable.png",
    "icon-512-maskable.png",
  ];

  for (const f of iconFiles) {
    const src = path.join(srcIconsDir, f);
    const dest = path.join(distIconsDir, f);
    if (!(await exists(src))) {
      throw new Error(`Missing source icon: ${src}. Run \"npm run icons:generate\" first.`);
    }
    await copyFile(src, dest);
    log(`Copied: ${path.relative(projectRoot, src)} -> ${path.relative(projectRoot, dest)}`);
  }

  // Apple touch icon (iOS uses this for Add to Home Screen)
  const iconSourcePath = (await exists(path.join(projectRoot, "assets", "images", "icon-source.png")))
    ? path.join(projectRoot, "assets", "images", "icon-source.png")
    : path.join(projectRoot, "assets", "images", "icon.png");

  const appleTouchPath = path.join(distIconsDir, "apple-touch-icon.png");
  const srcBuffer = await fs.readFile(iconSourcePath);
  await sharp(srcBuffer)
    .resize(180, 180, { fit: "contain", background: backgroundColor })
    .png({ compressionLevel: 9 })
    .toFile(appleTouchPath);
  log(`Wrote: ${path.relative(projectRoot, appleTouchPath)} (180x180)`);

  // Manifest
  const manifest = {
    name,
    short_name: shortName,
    start_url: ".",
    scope: ".",
    display: "standalone",
    background_color: backgroundColor,
    theme_color: themeColor,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };

  const manifestPath = path.join(distDir, "manifest.json");
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  log(`Wrote: ${path.relative(projectRoot, manifestPath)}`);

  // Minimal service worker (required for install prompt in many browsers)
  const swPath = path.join(distDir, "sw.js");
  await writeFile(
    swPath,
    `/* Minimal PWA service worker (pass-through) */\n` +
      `self.addEventListener('install', () => self.skipWaiting());\n` +
      `self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));\n` +
      `self.addEventListener('fetch', (event) => {\n` +
      `  event.respondWith(fetch(event.request));\n` +
      `});\n`
  );
  log(`Wrote: ${path.relative(projectRoot, swPath)}`);

  // Patch dist/index.html to reference manifest + apple-touch-icon and register SW
  const indexPath = path.join(distDir, "index.html");
  let html = await fs.readFile(indexPath, "utf8");

  html = await injectOnce(
    html,
    "</head>",
    `\n    <link rel="manifest" href="/manifest.json" />\n` +
      `    <meta name="theme-color" content="${themeColor}" />\n` +
      `    <meta name="apple-mobile-web-app-capable" content="yes" />\n` +
      `    <meta name="apple-mobile-web-app-status-bar-style" content="default" />\n` +
      `    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />\n`
  );

  html = await injectOnce(
    html,
    "</body>",
    `\n  <script>\n` +
      `    if ('serviceWorker' in navigator) {\n` +
      `      window.addEventListener('load', function () {\n` +
      `        navigator.serviceWorker.register('/sw.js');\n` +
      `      });\n` +
      `    }\n` +
      `  </script>\n`
  );

  await fs.writeFile(indexPath, html);
  log(`Patched: ${path.relative(projectRoot, indexPath)}`);

  log("PWA postbuild done.");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

