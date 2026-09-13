import {
  GUEST_CLIENT_ID,
  GUEST_CLIENT_SECRET,
  FF_RELEASE_VERSION,
} from "./config.js";
import { getRegion } from "./regions.js";
import { generateFFToken } from "./jwt.js";

const UA = "okhttp/3.12.13";
const UNITY_VERSION = "2018.4.11f1";

export async function guestLogin(region = "sg") {
  const cfg = getRegion(region);

  if (!GUEST_CLIENT_SECRET) {
    throw new Error(
      "GUEST_CLIENT_SECRET is not configured. Set it in Vercel env vars."
    );
  }

  const body = new URLSearchParams({
    uid: "0",
    password: "",
    response_type: "token",
    client_type: "2",
    client_secret: GUEST_CLIENT_SECRET,
    client_id: GUEST_CLIENT_ID,
  });

  const res = await fetch(cfg.login, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": UA,
    },
    body: body.toString(),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Guest login failed (${res.status}): ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Guest login returned non-JSON: ${text.slice(0, 200)}`);
  }
}

export async function fetchAccountInfo(uid, token, region = "sg") {
  const cfg = getRegion(region);

  const res = await fetch(`${cfg.client}/GetAccountInfo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": UA,
      "X-Unity-Version": UNITY_VERSION,
      ReleaseVersion: FF_RELEASE_VERSION,
    },
    body: JSON.stringify({ uid }),
  });

  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}
  return { ok: res.ok, status: res.status, data, raw: text };
}

export async function likeProfile(targetUid, token, region = "sg") {
  const cfg = getRegion(region);

  const res = await fetch(`${cfg.client}/LikeProfile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": UA,
      "X-Unity-Version": UNITY_VERSION,
      ReleaseVersion: FF_RELEASE_VERSION,
    },
    body: JSON.stringify({ target_uid: String(targetUid) }),
  });

  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}

  return { ok: res.ok, status: res.status, data, raw: text };
}

export async function likeWithFreshSession(targetUid, region = "sg", obOverride) {
  const regionKey = String(region || "sg").toLowerCase();
  const cfg = getRegion(regionKey);

  // OB override: kalau caller kirim "OB55", pakai itu.
  const releaseHeader = obOverride || FF_RELEASE_VERSION;

  const login = await guestLogin(regionKey);
  const accessToken = login.access_token;
  const openId = login.open_id;

  if (!accessToken || !openId) {
    throw new Error(
      `Login response missing access_token/open_id: ${JSON.stringify(login).slice(0, 200)}`
    );
  }

  const ffToken = generateFFToken({
    accessToken,
    openId,
    region: regionKey.toUpperCase(),
  });

  // Panggil likeProfile dengan release header yang sudah di-override
  const res = await fetch(`${cfg.client}/LikeProfile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ffToken}`,
      "User-Agent": UA,
      "X-Unity-Version": UNITY_VERSION,
      ReleaseVersion: releaseHeader,
    },
    body: JSON.stringify({ target_uid: String(targetUid) }),
  });

  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}

  return {
    uid: openId,
    region: regionKey,
    region_name: cfg.name,
    release_version: releaseHeader,
    ok: res.ok,
    status: res.status,
    data,
    raw: text,
  };
}
