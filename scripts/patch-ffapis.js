// scripts/patch-ffapis.js
// Patch file yang hilang dari package ffapis di npm.
// Dijalankan otomatis setelah `npm install` (postinstall).

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FF = path.join(ROOT, "node_modules", "ffapis");

console.log("[patch-ffapis] start");

if (!fs.existsSync(FF)) {
  console.log("[patch-ffapis] ffapis not installed, skipping");
  process.exit(0);
}

// ─────────────────────────────────────────────────────
//  1. Bikin config/settings.yaml kalau gak ada
// ─────────────────────────────────────────────────────
const configDir = path.join(FF, "config");
const settingsFile = path.join(configDir, "settings.yaml");

if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
  console.log("[patch-ffapis] created config/");
}

if (!fs.existsSync(settingsFile)) {
  const defaultYaml = [
    "# Auto-generated fallback by patch-ffapis.js",
    "ob_version: OB54",
    "default_region: sg",
    "regions:",
    "  sg: https://client-sg.ggpolarbear.com",
    "  id: https://client.id.freefiremobile.com",
    "  ind: https://client.ind.freefiremobile.com",
    "  th: https://client.th.freefiremobile.com",
    "  vn: https://client.vn.freefiremobile.com",
    "  ru: https://client.ru.freefiremobile.com",
    "  me: https://client.me.freefiremobile.com",
    "  bp: https://clientbp.ggpolarbear.com",
    "",
  ].join("\n");

  fs.writeFileSync(settingsFile, defaultYaml, "utf8");
  console.log("[patch-ffapis] created config/settings.yaml");
} else {
  console.log("[patch-ffapis] config/settings.yaml already exists");
}

// ─────────────────────────────────────────────────────
//  2. Bikin chunk file yang hilang di dist/ (kalau ada)
// ─────────────────────────────────────────────────────
const distDir = path.join(FF, "dist");

if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(distDir);
  const missingChunks = files.filter((f) => f.endsWith(".mjs"));

  console.log("[patch-ffapis] dist/ contents:", files.join(", "));
}

console.log("[patch-ffapis] done");
