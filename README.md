# Stickmen War PWA

## Menjalankan lokal
PWA tidak berjalan optimal lewat `file://`. Jalankan server lokal, misalnya:

```bash
python -m http.server 8080
```

Buka `http://localhost:8080`. Untuk deploy, upload seluruh isi folder ke GitHub Pages atau Cloudflare Pages.

## Struktur
- `index.html`: struktur UI
- `css/game.css`: tampilan game lama yang sudah dipisahkan
- `css/mobile-controls.css`: kontrol mobile gaya MOBA
- `js/game.js`: gameplay utama
- `js/mobile-controls.js`: joystick analog
- `manifest.webmanifest` dan `service-worker.js`: paket PWA/offline
