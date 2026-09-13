// api/health.js
import ff from "ffapis";
import { DEFAULT_OB_VERSION } from "../lib/ff.js";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  return res.status(200).json({
    success: true,
    service: "ff-like-api",
    version: "2.0.0",
    engine: "ffapis",
    engine_version: ff.VERSION || "3.0.1",
    ob_version: DEFAULT_OB_VERSION,
    rate_limit: "1000 likes/hour per IP",
    time: new Date().toISOString(),
  });
}
