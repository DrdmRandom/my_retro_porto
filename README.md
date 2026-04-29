# My Portfolio (Next.js)

Landing page portfolio bertema cloud/devops dengan:

- Integrasi Strapi CMS (`CMS_Dawwi`) untuk project public, close/private, dan pengalaman kerja.
- Integrasi Plausible Analytics self-hosted untuk tracking pageview.
- Theme auto mengikuti preferensi sistem (`dark`/`light`) + toggle manual.
- Desain responsif untuk HP, tablet, dan laptop kecil.
- Port aplikasi `3004`.

## 1) Jalankan lokal

```bash
corepack pnpm install
corepack pnpm dev
```

Buka: `http://localhost:3004`

## 2) Environment

Copy `.env.example` menjadi `.env` lalu sesuaikan endpoint collection Strapi.
Jika pakai Plausible self-hosted, isi juga:

- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
- `NEXT_PUBLIC_PLAUSIBLE_API_HOST`

## 3) Deploy dengan Podman

```bash
podman-compose -f podman-compose.yml up -d --build
```

## 4) Struktur data Strapi yang didukung

Field akan dibaca fleksibel, minimal:

- Project: `title`, `description`, `tags`, `repo_url`, `live_url`
- Experience: `role`, `company`, `period`, `location`, `summary`

Jika data masih kosong, landing page tetap tampil dengan empty state.
