// api/regions.js
import { ALLOWED_REGIONS } from "../lib/config.js";

const NAMES = {
  sg: "Singapore",
  id: "Indonesia",
  ind: "India",
  th: "Thailand",
  vn: "Vietnam",
  ru: "Russia",
  me: "Middle East",
  bp: "Brazil",
  pk: "Pakistan",
  bd: "Bangladesh",
  eg: "Egypt",
  sa: "Saudi Arabia",
  my: "Malaysia",
  ph: "Philippines",
  br: "Brazil",
  us: "United States",
};

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  return res.status(200).json({
    success: true,
    count: ALLOWED_REGIONS.length,
    regions: ALLOWED_REGIONS.map((code) => ({
      code,
      name: NAMES[code] || code.toUpperCase(),
    })),
  });
}
