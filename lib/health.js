import { FF_JWT_KEY, GUEST_CLIENT_SECRET, FF_RELEASE_VERSION } from "../lib/config.js";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  return res.status(200).json({
    success: true,
    service: "ff-like-api",
    version: "1.1.0",
    release_version: FF_RELEASE_VERSION,
    time: new Date().toISOString(),
    config: {
      jwt_key_set: Boolean(FF_JWT_KEY),
      client_secret_set: Boolean(GUEST_CLIENT_SECRET),
    },
  });
}
