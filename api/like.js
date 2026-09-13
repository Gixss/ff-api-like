import { sendLike, rateCheck } from "../lib/ff.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Use POST." });
  }

  try {
    const { uid, region, count } = req.body || {};

    if (!uid) {
      return res.status(400).json({ success: false, error: "Missing uid." });
    }

    const reqCount = Math.max(1, Math.min(Number(count) || 1, 40));
    const regionKey = String(region || "sg").toLowerCase();

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown";

    const rl = rateCheck(ip, reqCount);

    if (!rl.ok) {
      return res.status(429).json({ success: false, error: "Rate limit." });
    }

    const result = await sendLike(uid, regionKey, reqCount);

    return res.status(200).json({
      success: result.success,
      target_uid: result.target_uid,
      success_count: result.successCount,
      failed_count: result.failedCount,
      remaining_guests: result.remainingGuests,
      message: result.message,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || String(err),
      stack: (err.stack || "").split("\n").slice(0, 5).join("\n"),
    });
  }
}
