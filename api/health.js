// api/health.js — standalone, no dependencies

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed.",
    });
  }

  return res.status(200).json({
    success: true,
    service: "ff-like-api",
    version: "2.0.0",
    engine: "ffapis",
    ob_version: process.env.FF_RELEASE || "OB54",
    rate_limit: "1000 likes/hour per IP",
    time: new Date().toISOString(),
  });
}
