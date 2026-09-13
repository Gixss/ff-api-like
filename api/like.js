// api/like.js
import { sendLike, rateCheck, DEFAULT_OB_VERSION } from "../lib/ff.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed. Use POST.",
    });
  }

  const { uid, region, count, ob } = req.body || {};

  // ── Validasi input ──
  if (!uid) {
    return res.status(400).json({
      success: false,
      error: "Missing 'uid' in request body.",
      example: { uid: "1234567890", region: "sg", count: 100 },
    });
  }

  if (!/^\d+$/.test(String(uid))) {
    return res.status(400).json({
      success: false,
      error: "'uid' must be numeric.",
    });
  }

  const reqCount = Math.max(1, Math.min(Number(count) || 1, 100));
  const regionKey = String(region || "sg").toLowerCase();

  // ── Rate limit check ──
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  const rl = rateCheck(ip, reqCount);

  res.setHeader("X-RateLimit-Limit", rl.limit ?? 1000);
  res.setHeader("X-RateLimit-Remaining", rl.remaining ?? 0);

  if (!rl.ok) {
    res.setHeader("Retry-After", rl.retryAfter);
    return res.status(429).json({
      success: false,
      error: `Rate limit exceeded. Coba lagi dalam ${rl.retryAfter} detik.`,
      retry_after: rl.retryAfter,
      used: rl.used,
      limit: rl.limit,
    });
  }

  // ── Execute ──
  try {
    const result = await sendLike(uid, regionKey, reqCount, ob);

    return res.status(200).json({
      success: result.success,
      target_uid: result.target_uid,
      region: result.region,
      ob_version: result.ob_version,
      requested: result.requested,
      success_count: result.successCount,
      failed_count: result.failedCount,
      remaining_guests: result.remainingGuests,
      message: result.message,
      rate_limit: {
        used: rl.used,
        remaining: rl.remaining,
        limit: rl.limit,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      hint: "Cek network atau status server Garena. Coba ulang beberapa saat lagi.",
    });
  }
}
