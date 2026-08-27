/**
 * Generate Android launcher icons and splash screens from the SVG logo.
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const res = path.resolve(__dirname, "..", "android/app/src/main/res");
const publicDir = path.resolve(__dirname, "..", "public");
const logoIcon = path.join(publicDir, "pandacrm-logo-icon.svg");
const bg = { r: 13, g: 13, b: 18 }; // #0d0d12

const iconSizes = [
  { dir: "mipmap-mdpi", size: 48, foreground: 108 },
  { dir: "mipmap-hdpi", size: 72, foreground: 162 },
  { dir: "mipmap-xhdpi", size: 96, foreground: 216 },
  { dir: "mipmap-xxhdpi", size: 144, foreground: 324 },
  { dir: "mipmap-xxxhdpi", size: 192, foreground: 432 },
];

const splashSizes = [
  { dir: "drawable", width: 480, height: 320 },
  { dir: "drawable-port-mdpi", width: 320, height: 480 },
  { dir: "drawable-port-hdpi", width: 480, height: 800 },
  { dir: "drawable-port-xhdpi", width: 720, height: 1280 },
  { dir: "drawable-port-xxhdpi", width: 960, height: 1600 },
  { dir: "drawable-port-xxxhdpi", width: 1280, height: 1920 },
  { dir: "drawable-land-mdpi", width: 480, height: 320 },
  { dir: "drawable-land-hdpi", width: 800, height: 480 },
  { dir: "drawable-land-xhdpi", width: 1280, height: 720 },
  { dir: "drawable-land-xxhdpi", width: 1600, height: 960 },
  { dir: "drawable-land-xxxhdpi", width: 1920, height: 1280 },
];

async function buildIcon(size) {
  const logo = await sharp(logoIcon)
    .resize(Math.round(size * 0.7), Math.round(size * 0.7), { fit: "inside" })
    .png()
    .toBuffer();
  const base = await sharp({
    create: { width: size, height: size, channels: 3, background: bg },
  })
    .png()
    .toBuffer();
  return sharp(base)
    .composite([{ input: logo, gravity: "center" }])
    .toBuffer();
}

async function buildForeground(size) {
  const iconSize = Math.round(size * 0.55);
  return sharp(logoIcon)
    .resize(iconSize, iconSize, { fit: "inside" })
    .png()
    .toBuffer();
}

async function buildSplash(width, height) {
  const logoSize = Math.round(Math.min(width, height) * 0.35);
  const logo = await sharp(logoIcon)
    .resize(logoSize, logoSize, { fit: "inside" })
    .png()
    .toBuffer();
  const base = await sharp({
    create: { width, height, channels: 3, background: bg },
  })
    .png()
    .toBuffer();
  return sharp(base)
    .composite([{ input: logo, gravity: "center" }])
    .toBuffer();
}

async function main() {
  console.log("Generating app icons...");
  for (const { dir, size, foreground } of iconSizes) {
    const outDir = path.join(res, dir);
    fs.mkdirSync(outDir, { recursive: true });

    const icon = await buildIcon(size);
    await sharp(icon).toFile(path.join(outDir, "ic_launcher.png"));
    await sharp(icon).toFile(path.join(outDir, "ic_launcher_round.png"));

    const fg = await buildForeground(foreground);
    await sharp(fg).toFile(path.join(outDir, "ic_launcher_foreground.png"));
  }

  console.log("Generating splash screens...");
  for (const { dir, width, height } of splashSizes) {
    const outDir = path.join(res, dir);
    fs.mkdirSync(outDir, { recursive: true });
    const splash = await buildSplash(width, height);
    await sharp(splash).toFile(path.join(outDir, "splash.png"));
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
