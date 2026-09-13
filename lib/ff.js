// lib/ff.js

const RATE = {
  MAX_PER_HOUR: 1000,
  WINDOW_MS: 60 * 60 * 1000,
  buckets: new Map(),
};

export function rateCheck(ip, amount = 1) {
  const now = Date.now();
  const arr = (RATE.buckets.get(ip) || []).filter(
    (t) => now - t.time < RATE.WINDOW_MS
  );

  const used = arr.reduce((sum, entry) => sum + entry.amount, 0);

  if (used + amount > RATE.MAX_PER_HOUR) {
    const retryAfter = arr[0]
      ? Math.ceil((RATE.WINDOW_MS - (now - arr[0].time)) / 1000)
      : 3600;
    return { ok: false, retryAfter, used, limit: RATE.MAX_PER_HOUR };
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

export async function sendLike(targetUid, region = "sg", count = 1) {
  // Lazy import — biar error-nya bisa ditangkep
  let mod;
  try {
    mod = await import("ffapis");
  } catch (err) {
    throw new Error("ffapis import failed: " + (err.message || String(err)));
  }

  const ff = mod.default || mod;
  const LikeAPI = ff.LikeAPI;

  if (!LikeAPI) {
    throw new Error("LikeAPI not found in ffapis. Exports: " + Object.keys(ff).join(","));
  }

  const api = new LikeAPI();
  const ob = ff.DEFAULT_OB_VERSION || "OB54";
  const reqCount = Math.max(1, Math.min(Number(count) || 1, 40));

  const result = await api.sendLikes(String(targetUid), region, reqCount, ob);

  return {
    target_uid: String(targetUid),
    region,
    ob_version: ob,
    requested: reqCount,
    success: result.success,
    successCount: result.successCount,
    failedCount: result.failedCount,
    remainingGuests: result.remainingGuests,
    message: result.message,
  };
}
