// lib/ff.js
import ff from "ffapis";

const { LikeAPI, DEFAULT_OB_VERSION } = ff;

// ─────────────────────────────────────────────────────────
//  Rate limiter — 1000 like per jam, sliding window per IP
// ─────────────────────────────────────────────────────────
const RATE = {
  MAX_PER_HOUR: 1000,
  WINDOW_MS: 60 * 60 * 1000,
  buckets: new Map(),
};

export function rateCheck(ip, amount = 1) {
  const now = Date.now();
  const arr = (RATE.buckets.get(ip) || []).filter(
    (t) => now - t < RATE.WINDOW_MS
  );

  const used = arr.reduce((sum, entry) => sum + entry.amount, 0);

  if (used + amount > RATE.MAX_PER_HOUR) {
    const oldest = arr[0];
    const retryAfter = Math.ceil(
      (RATE.WINDOW_MS - (now - oldest.time)) / 1000
    );
    return {
      ok: false,
      retryAfter,
      used,
      limit: RATE.MAX_PER_HOUR,
    };
  }

  arr.push({ time: now, amount });
  RATE.buckets.set(ip, arr);

  return {
    ok: true,
    remaining: RATE.MAX_PER_HOUR - used - amount,
    used: used + amount,
    limit: RATE.MAX_PER_HOUR,
  };
}

// Cleanup tiap 5 menit
setInterval(() => {
  const now = Date.now();
  for (const [ip, arr] of RATE.buckets.entries()) {
    const fresh = arr.filter((e) => now - e.time < RATE.WINDOW_MS);
    if (fresh.length === 0) RATE.buckets.delete(ip);
    else RATE.buckets.set(ip, fresh);
  }
}, 5 * 60 * 1000);

// ─────────────────────────────────────────────────────────
//  Core: kirim like pakai ffapis
// ─────────────────────────────────────────────────────────
const apiCache = new Map(); // region → LikeAPI instance

function getApi(region) {
  const key = String(region || "sg").toLowerCase();
  if (!apiCache.has(key)) {
    const api = new LikeAPI();
    if (api.setObVersion) {
      api.setObVersion(DEFAULT_OB_VERSION);
    }
    apiCache.set(key, api);
  }
  return apiCache.get(key);
}

export async function sendLike(targetUid, region = "sg", count = 1, obVersion = null) {
  const regionKey = String(region || "sg").toLowerCase();
  const api = getApi(regionKey);
  const ob = obVersion || DEFAULT_OB_VERSION;

  // ffapis cap: max 100 per target
  const requested = Math.max(1, Math.min(Number(count) || 1, 100));

  const result = await api.sendLikes(String(targetUid), regionKey, requested, ob);

  return {
    target_uid: String(targetUid),
    region: regionKey,
    ob_version: ob,
    requested,
    success: result.success,
    successCount: result.successCount,
    failedCount: result.failedCount,
    remainingGuests: result.remainingGuests,
    message: result.message,
  };
}

export async function getAvailableGuests(targetUid, region = "sg") {
  try {
    const api = getApi(region);
    const cm = api["_getCredentialManager"](region);
    const count = cm.getAvailableCount(String(targetUid));
    const total = cm.getPoolSize ? cm.getPoolSize() : 0;
    return { available: count, total };
  } catch (err) {
    return { available: 0, total: 0, error: err.message };
  }
}

export { DEFAULT_OB_VERSION };
