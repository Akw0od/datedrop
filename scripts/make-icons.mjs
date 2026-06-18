// 生成 PWA / iOS 图标（玫瑰底 + 白心），输出到 /public
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const pub = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

const svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fb2c52"/>
      <stop offset="1" stop-color="#e11d48"/>
    </linearGradient>
    <radialGradient id="hl" cx="0.32" cy="0.24" r="0.75">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <rect width="512" height="512" fill="url(#hl)"/>
  <path d="M256 430 C256 430 76 312 76 196 C76 138 118 104 162 104 C200 104 232 126 256 162 C280 126 312 104 350 104 C394 104 436 138 436 196 C436 312 256 430 256 430 Z" fill="#ffffff"/>
</svg>`;

// apple-touch-icon 不透明（iOS 自己圆角），用白底兜底避免黑边
const buf = Buffer.from(svg);
const targets = [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["icon-maskable.png", 512],
  ["apple-touch-icon.png", 180],
];

for (const [name, size] of targets) {
  await sharp(buf)
    .resize(size, size)
    .flatten({ background: "#e11d48" })
    .png()
    .toFile(join(pub, name));
  console.log("✓", name, size);
}
console.log("图标生成完成");
