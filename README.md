<div align="center">

# ff-like-api

**Free Fire like endpoint — Vercel serverless API.**

**Endpoint like Free Fire — API serverless untuk Vercel.**

<br>

[![Version](https://img.shields.io/badge/version-1.1.0-84cc16?style=for-the-badge&labelColor=0a0b0d)](https://github.com/YourUser/ff-like-api/releases)
[![License](https://img.shields.io/badge/license-MIT-84cc16?style=for-the-badge&labelColor=0a0b0d)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-84cc16?style=for-the-badge&labelColor=0a0b0d&logo=node.js&logoColor=white)](https://nodejs.org)
[![Vercel](https://img.shields.io/badge/vercel-ready-84cc16?style=for-the-badge&labelColor=0a0b0d&logo=vercel&logoColor=white)](https://vercel.com)
[![Release](https://img.shields.io/badge/free%20fire-OB54-84cc16?style=for-the-badge&labelColor=0a0b0d)](#)

<br>

[Overview](#overview) · [Deploy](#deploy) · [Environment](#environment-variables) · [Endpoints](#endpoints) · [Usage](#usage) · [Troubleshooting](#troubleshooting)

</div>

---

## Overview

### English

`ff-like-api` is a small serverless API that sends likes to a Free Fire profile. It runs entirely on Vercel's Node.js runtime — no database, no persistent process, no extra infrastructure. Each request performs a fresh guest login against Garena's OAuth, signs a JWT, and forwards a like to the target UID.

### Indonesia

`ff-like-api` adalah API serverless kecil untuk mengirim like ke profil Free Fire. Berjalan sepenuhnya di runtime Node.js Vercel — tanpa database, tanpa proses persistent, tanpa infrastruktur tambahan. Setiap request melakukan guest login baru ke OAuth Garena, menandatangani JWT, lalu meneruskan like ke UID target.

---

## Features

| Feature | English | Indonesia |
|---|---|---|
| Serverless | Runs on Vercel Functions | Berjalan di Vercel Functions |
| Multi-region | 8 FF regions supported | 8 region FF didukung |
| Zero state | No database required | Tanpa database |
| Zero config | Deploy with `git push` | Deploy dengan `git push` |
| CORS | Enabled by default | Aktif secara default |
| OB override | Change release per request | Ubah release per request |
| Health check | Env var verification | Verifikasi env var |

---

## Deploy

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/YourUser/ff-like-api.git
git push -u origin main
```

### 2. Import to Vercel

1. Buka [vercel.com/new](https://vercel.com/new)
2. Pilih **Import Git Repository**
3. Pilih repo `ff-like-api`
4. Klik **Deploy** (jangan set env dulu — set setelah selesai)

### 3. Set Environment Variables

Setelah deploy pertama selesai:

1. Buka project → **Settings** → **Environment Variables**
2. Tambahkan variable di bawah (lihat [Environment Variables](#environment-variables))
3. Klik **Save**
4. Buka tab **Deployments** → **Redeploy** yang terbaru

### 4. Verify

```bash
curl https://your-app.vercel.app/api/health
```

Response:
```json
{
  "success": true,
  "service": "ff-like-api",
  "release_version": "OB54",
  "config": {
    "jwt_key_set": true,
    "client_secret_set": true
  }
}
```

Kalau `jwt_key_set` dan `client_secret_set` = `false`, berarti env var belum terpasang atau belum redeploy.

---

## Environment Variables

| Variable | Required | Default | Keterangan |
|---|---|---|---|
| `FF_JWT_KEY` | Ya | — | HS256 secret yang dipakai FF client untuk sign JWT |
| `FF_CLIENT_SECRET` | Ya | — | OAuth guest client secret |
| `FF_CLIENT_ID` | Tidak | `100067` | OAuth client ID |
| `FF_RELEASE` | Tidak | `OB54` | Release version header |

`FF_JWT_KEY` dan `FF_CLIENT_SECRET` bukan nilai publik. Nilai ini harus diambil dari sumber MASTER sendiri (extract dari client FF atau dari sumber komunitas terpercaya). Repo ini **tidak** menyertakan nilai default untuk dua variable ini.

---

## Endpoints

### `POST /api/like`

Kirim like ke UID target.

**Body:**
```json
{
  "uid": "1234567890",
  "region": "sg",
  "ob": "OB54"
}
```

| Field | Type | Required | Keterangan |
|---|---|---|---|
| `uid` | string | Ya | UID target (numeric) |
| `region` | string | Tidak | Region code, default `sg` |
| `ob` | string | Tidak | Override release version, default dari env |

**Response sukses:**
```json
{
  "success": true,
  "target_uid": "1234567890",
  "region": "sg",
  "region_name": "Singapore",
  "release_version": "OB54",
  "upstream_status": 200,
  "data": { "...": "..." }
}
```

**Response error:**
```json
{
  "success": false,
  "target_uid": "1234567890",
  "region": "sg",
  "upstream_status": 403,
  "raw": "..."
}
```

---

### `GET /api/regions`

List semua region code yang tersedia.

**Response:**
```json
{
  "success": true,
  "count": 8,
  "regions": [
    { "code": "sg", "name": "Singapore" },
    { "code": "id", "name": "Indonesia" },
    { "code": "ind", "name": "India" },
    { "code": "th", "name": "Thailand" },
    { "code": "vn", "name": "Vietnam" },
    { "code": "ru", "name": "Russia" },
    { "code": "me", "name": "Middle East" },
    { "code": "bp", "name": "Brazil" }
  ]
}
```

---

### `GET /api/health`

Service status dan verifikasi env var.

**Response:**
```json
{
  "success": true,
  "service": "ff-like-api",
  "version": "1.1.0",
  "release_version": "OB54",
  "time": "2026-09-13T10:00:00.000Z",
  "config": {
    "jwt_key_set": true,
    "client_secret_set": true
  }
}
```

---

## Usage

### cURL

```bash
curl -X POST https://your-app.vercel.app/api/like \
  -H "Content-Type: application/json" \
  -d '{"uid":"1234567890","region":"sg"}'
```

### JavaScript (fetch)

```js
const res = await fetch("https://your-app.vercel.app/api/like", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ uid: "1234567890", region: "sg" })
});

const data = await res.json();
console.log(data);
```

### Python (requests)

```python
import requests

res = requests.post(
    "https://your-app.vercel.app/api/like",
    json={"uid": "1234567890", "region": "sg"}
)
print(res.json())
```

### PHP

```php
$ch = curl_init("https://your-app.vercel.app/api/like");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "uid" => "1234567890",
    "region" => "sg"
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
echo $response;
```

---

## Project Structure

```
ff-like-api/
├── api/
│   ├── like.js         POST endpoint
│   ├── regions.js      GET region list
│   └── health.js       GET service status
├── lib/
│   ├── config.js       Env var loader
│   ├── jwt.js          JWT signer (HS256)
│   ├── regions.js      Region endpoint map
│   └── ff.js           Core logic (login, like)
├── package.json
├── vercel.json
├── .gitignore
└── README.md
```

---

## Troubleshooting

| HTTP | Kemungkinan Penyebab | Solusi |
|---|---|---|
| `401` | `FF_JWT_KEY` atau `FF_CLIENT_SECRET` salah / expired | Update env var, redeploy |
| `403` | `ReleaseVersion` outdated | Kirim `"ob": "OB55"` atau versi terbaru |
| `404` | Endpoint client URL berubah | Update `lib/regions.js` |
| `405` | Method salah | Gunakan `POST` untuk `/api/like` |
| `429` | Rate limit Garena | Tunggu 1 jam, atau pakai proxy rotation |
| `500` + `"not configured"` | Env var belum diset | Set di Vercel Settings, redeploy |
| `500` + `"non-JSON"` | Response upstream bukan JSON | Kemungkinan endpoint deprecated, cek `lib/regions.js` |

---

## Notes

Endpoint Free Fire di-maintain oleh Garena dan bisa berubah tanpa pemberitahuan. Kalau API berhenti bekerja, kemungkinan besar salah satu dari ini:

1. `ReleaseVersion` header sudah deprecated — ganti ke OB terbaru
2. Endpoint client URL sudah dipindah — update `lib/regions.js`
3. OAuth `client_secret` sudah dirotasi — cari nilai baru

Repo ini tidak menyimpan nilai credential apapun. Semua nilai sensitif disimpan di Vercel Environment Variables dan tidak pernah masuk ke git.

---

## Contributing

Pull request diterima. Untuk perubahan besar, buka issue terlebih dahulu agar bisa didiskusikan.

---

## License

MIT — lihat [LICENSE](LICENSE).

---

<div align="center">

Made by **Gixss**

</div>