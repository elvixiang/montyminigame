# MONTY GAME — Web App

Endless-runner buat MONTY&Co. Pemain dandanin Monty, balap kumpulin XL Drink,
masuk leaderboard, dan dapat **ID Card**. Juara #1 bisa kirim ID Card ke emailnya.

File ini bisa langsung di-upload ke **Vercel** sebagai website statis. Leaderboard
dan fitur email-juara butuh backend gratis (Google Apps Script) — caranya di bawah.

---

## A. Upload ke Vercel (tanpa backend dulu)

Cara paling gampang (tanpa install apa-apa):

1. Masuk ke https://vercel.com → **Add New ▸ Project**.
2. Pilih **Deploy** lalu seret folder ini, ATAU hubungkan repo GitHub yang isinya folder ini.
   - Kalau ditanya framework: pilih **Other** (ini situs statis biasa).
3. Klik **Deploy**. Selesai — kamu dapat URL seperti `https://monty-game.vercel.app`.

Tanpa backend, game tetap jalan penuh; leaderboard disimpan **lokal di tiap perangkat**
(belum nyambung ke spreadsheet, dan email juara belum aktif). Untuk leaderboard
**bersama** + email, lanjut ke bagian B.

> File yang dibutuhkan Vercel cuma `index.html` (+ `vercel.json` opsional).
> `apps_script.gs` dan `README.md` tidak ikut dipublish, cuma buat kamu.

---

## B. Sambungkan leaderboard ke Google Sheet + email juara

Ini bikin semua pemain masuk ke **satu leaderboard** di Google Sheet kamu, dan
mengaktifkan tombol **kirim ID Card ke email** untuk Juara #1. Gratis, tanpa API key.

1. Buat / buka **Google Sheet** baru (ini jadi database leaderboard).
2. Di Sheet itu: menu **Extensions ▸ Apps Script**.
3. Hapus kode contoh, lalu **copy–paste seluruh isi `apps_script.gs`** ke sana. Save.
4. Klik **Deploy ▸ New deployment**.
   - Klik ikon gerigi ▸ pilih tipe **Web app**.
   - **Execute as:** Me
   - **Who has access:** Anyone
   - Klik **Deploy**, izinkan akses (authorize) saat diminta.
5. **Copy "Web app URL"** (berakhiran `/exec`).
6. Buka `index.html`, cari baris ini di dekat bagian leaderboard:

   ```js
   const BACKEND_URL = "";
   ```

   Isi dengan URL tadi:

   ```js
   const BACKEND_URL = "https://script.google.com/macros/s/AKfyc..../exec";
   ```

7. Simpan, lalu **re-deploy ke Vercel** (drag folder lagi, atau push ke GitHub).

Selesai. Sekarang:
- Setiap skor masuk ke tab **"Leaderboard"** di Sheet kamu otomatis.
- Pemain peringkat #1 lihat kotak **"Kirim ID Card ke email"** di kartu — emailnya
  dikirim dari Gmail kamu lewat MailApp (kuota gratis ±100 email/hari).

---

## Catatan

- **Ganti musik/SFX/aset:** semuanya sudah tertanam (embedded) di `index.html`.
- **Reset leaderboard:** hapus baris-baris di tab "Leaderboard" pada Sheet (sisakan
  baris judul `ts | name | score | finished | outfit`).
- **Privasi email:** email pemain hanya dipakai saat tombol kirim ditekan; tidak
  disimpan di Sheet.
- **CORS:** Apps Script web app yang di-deploy "Anyone" sudah bisa diakses dari
  domain Vercel kamu. Game memakai `Content-Type: text/plain` supaya tidak kena
  preflight. Kalau suatu saat browser memblokir, pastikan deployment Apps Script
  versi terbaru (Deploy ▸ Manage deployments ▸ Edit ▸ New version).
