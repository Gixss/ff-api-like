// lib/config.js

export const DEFAULT_OB = process.env.FF_RELEASE || "OB54";

export const RATE_LIMIT = {
  MAX_PER_HOUR: 1000,
  WINDOW_MS: 60 * 60 * 1000,
};

export const ALLOWED_REGIONS = [
  "sg", "id", "ind", "th", "vn", "ru", "me", "bp",
  "pk", "bd", "eg", "sa", "my", "ph", "br", "us",
];
