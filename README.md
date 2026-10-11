# 📚 BukuKita — Sistem Persediaan & Penjualan Buku

Aplikasi web untuk mengelola buku, supplier, pelanggan, dan transaksi penjualan. Stok buku berkurang otomatis saat ada penjualan dan kembali saat transaksi dihapus.

## Struktur
```
├── index.html          # pengarah ke frontend (untuk GitHub Pages)
├── frontend/           # tampilan: index.html, style.css, script.js
└── backend/schema.sql  # skema database Supabase
```

## 4 Entitas
Buku · Supplier · Pelanggan · Penjualan

## Cara Menjalankan
1. Buka Supabase → **SQL Editor**, jalankan isi `backend/schema.sql`.
2. Buka `frontend/index.html` di browser, atau aktifkan **GitHub Pages** (Settings → Pages → branch `main`, folder `/root`).

## Teknologi
HTML, CSS, JavaScript, Supabase (PostgreSQL).

> Catatan: policy database saat ini terbuka untuk kunci publishable (tanpa login) — cocok untuk demo/tugas.
