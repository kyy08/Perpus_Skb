# Frontend Perpus SKB Kota Tegal

Frontend React untuk sistem perpustakaan SKB Kota Tegal. Komponen visual dari mockup dipertahankan, sedangkan data diambil dari REST API backend.

## Menjalankan

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Frontend berjalan di `http://localhost:8080` dan menggunakan backend di `http://localhost:3000/api/v1`.

## Halaman Utama

- Login dan registrasi anggota.
- Dashboard pengelola.
- Data buku dan ketersediaan eksemplar.
- Data anggota.
- Approval pengajuan peminjaman.
- Peminjaman dan pengembalian.
- Denda.
- Laporan Excel.
- Pengaturan sistem.
