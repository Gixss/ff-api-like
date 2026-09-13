import { likeWithFreshSession } from "../lib/ff.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  const { uid, region, ob } = req.body || {};
  const queryOb = req.query?.ob;
  const obOverride = ob || queryOb;

  if (!uid) {
    return res.status(400).json({
      success: false,
      error: "Missing 'uid' in request body.",
      example: { uid: "1234567890", region: "sg", ob: "OB54" },
    });
  }

  if (!/^\d+$/.test(String(uid))) {
    return res.status(400).json({ success: false, error: "'uid' must be numeric." });
  }

  try {
    const result = await likeWithFreshSession(uid, region || "sg", obOverride);

    return res.status(200).json({
      success: result.ok,
      target_uid: String(uid),
      region: result.region,
      region_name: result.region_name,
      release_version: result.release_version,
      upstream_status: result.status,
      data: result.data,
      raw: result.ok ? undefined : result.raw?.slice(0, 500),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      hint:
        "Set FF_JWT_KEY and FF_CLIENT_SECRET in Vercel env vars. " +
        "Kalau OB54 sudah deprecated, kirim 'ob': 'OB55' atau versi terbaru.",
    });
  }
}