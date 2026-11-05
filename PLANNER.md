# Planner Sistem Perpus SKB Kota Tegal

## Tujuan

Membangun backend sistem informasi perpustakaan yang menangani katalog buku, anggota, pengajuan peminjaman, pengembalian, keterlambatan, denda, dashboard, dan laporan Excel.

Frontend React akan dibuat setelah backend dan kontrak API selesai.

## Keputusan Teknis

- Runtime: Node.js 20+
- Backend: Express 5
- Bahasa: JavaScript ESM
- Database: MySQL 8+
- ORM dan migration: Prisma
- Autentikasi: JWT dan bcryptjs
- Validasi: Zod
- Export Excel: ExcelJS
- Frontend tahap berikutnya: React + Vite

## Aturan Bisnis Awal

- Anggota dapat mendaftar dan login sendiri.
- Petugas dibuat melalui seed atau pengelolaan internal.
- Satu anggota maksimal memiliki 2 buku aktif.
- Pengajuan peminjaman wajib disetujui petugas.
- Anggota mengajukan durasi peminjaman.
- Durasi maksimal awal adalah 14 hari dan disimpan di `system_settings`.
- Denda awal adalah Rp1.000 per buku per hari dan disimpan di `system_settings`.
- Ketersediaan buku mengikuti status setiap baris `book_copies`.
- Approval dan pengembalian wajib menggunakan transaction database.
- Buku dan anggota yang memiliki riwayat tidak dihapus permanen.

## Prinsip Clean Architecture

```text
Route
  -> Validator
  -> Middleware
  -> Controller
  -> Service atau Use Case
  -> Repository Interface
  -> Prisma Repository
  -> MySQL
```

Aturan dependency:

- Domain tidak bergantung pada Express atau Prisma.
- Service atau use case berisi aturan bisnis.
- Controller hanya menangani HTTP request dan response.
- Validator hanya memvalidasi input.
- Repository interface digunakan oleh service.
- Prisma repository mengimplementasikan repository interface.
- `main/container.js` menyusun seluruh dependency aplikasi.

## Struktur Backend Target

```text
backend/src/
├── main/
│   ├── app.js
│   ├── server.js
│   └── container.js
├── config/
├── shared/
│   ├── errors/
│   ├── http/
│   ├── utils/
│   └── validation/
└── modules/
    ├── auth/
    │   ├── domain/
    │   ├── application/
    │   ├── infrastructure/
    │   └── presentation/
    ├── members/
    ├── catalog/
    ├── loans/
    ├── fines/
    ├── dashboard/
    └── reports/
```

Struktur setiap modul:

```text
module-name/
├── domain/
│   ├── entities/
│   ├── errors/
│   └── repositories/
├── application/
│   ├── services/
│   └── dto/
├── infrastructure/
│   ├── repositories/
│   └── services/
└── presentation/
    ├── controllers/
    ├── routes/
    └── validators/
```

## Tahap Implementasi Backend

### Tahap 0 - Fondasi

- [x] Setup Express dan scripts npm.
- [x] Setup environment validation.
- [x] Setup Prisma schema MySQL.
- [x] Setup health check dan error handler dasar.
- [x] Refactor ke `main`, `shared`, dan struktur modul.
- [x] Membuat format response API standar.
- [x] Membuat error domain dan error HTTP.
- [x] Membuat dependency container.
- [x] Membuat migration pertama.
- [x] Membuat seed akun petugas dan system settings.

### Tahap 1 - Autentikasi

- [x] Registrasi anggota.
- [x] Login semua role.
- [x] JWT authentication.
- [x] Middleware role `PETUGAS` dan `ANGGOTA`.
- [x] Endpoint profil pengguna.
- [x] Perubahan password.
- [x] Penonaktifan akun melalui status anggota.

Endpoint target:

```text
POST  /api/v1/auth/register
POST  /api/v1/auth/login
GET   /api/v1/auth/me
PATCH /api/v1/auth/password
```

### Tahap 2 - Anggota

- [x] Melihat profil anggota.
- [x] Daftar anggota untuk petugas.
- [x] Detail anggota.
- [x] Ubah data anggota.
- [x] Ubah status anggota.
- [x] Riwayat peminjaman anggota melalui filter `memberId`.
- [x] Riwayat denda anggota.

### Tahap 3 - Katalog Buku

- [x] CRUD kategori.
- [x] CRUD penulis.
- [x] CRUD penerbit.
- [x] CRUD judul buku.
- [x] CRUD eksemplar buku.
- [x] Kode inventaris unique.
- [x] Pencarian judul, ISBN, penulis, dan kategori.
- [x] Pagination dan filter status.
- [x] Informasi buku tersedia dan sedang dipinjam.

Endpoint target:

```text
GET    /api/v1/books
POST   /api/v1/books
GET    /api/v1/books/:id
PATCH  /api/v1/books/:id
DELETE /api/v1/books/:id
GET    /api/v1/books/:id/copies
POST   /api/v1/books/:id/copies
PATCH  /api/v1/book-copies/:id
```

### Tahap 4 - Pengajuan dan Persetujuan

- [x] Anggota membuat pengajuan.
- [x] Validasi maksimal 2 buku aktif.
- [x] Validasi durasi peminjaman.
- [x] Validasi anggota aktif.
- [x] Anggota melihat pengajuan sendiri.
- [x] Petugas melihat pengajuan pending.
- [x] Petugas menyetujui pengajuan.
- [x] Petugas menolak pengajuan dengan alasan.
- [x] Pemilihan eksemplar menggunakan transaction dan row locking.

Endpoint target:

```text
POST  /api/v1/loan-requests
GET   /api/v1/loan-requests/me
GET   /api/v1/loan-requests
PATCH /api/v1/loan-requests/:id/approve
PATCH /api/v1/loan-requests/:id/reject
```

### Tahap 5 - Peminjaman dan Pengembalian

- [x] Membuat nomor transaksi.
- [x] Menentukan tanggal jatuh tempo.
- [x] Mengubah status eksemplar menjadi `BORROWED`.
- [x] Melihat peminjaman aktif.
- [x] Melihat riwayat peminjaman.
- [x] Pengembalian satu eksemplar.
- [x] Pengembalian seluruh transaksi.
- [x] Mengubah status eksemplar menjadi `AVAILABLE`.
- [x] Mengubah status transaksi menjadi `RETURNED`.

Endpoint target:

```text
GET   /api/v1/loans
GET   /api/v1/loans/me
GET   /api/v1/loans/overdue
GET   /api/v1/loans/:id
PATCH /api/v1/loans/:id/items/:itemId/return
```

### Tahap 6 - Keterlambatan dan Denda

- [x] Menghitung hari keterlambatan.
- [x] Menghitung nominal denda.
- [x] Membuat data denda saat pengembalian.
- [x] Melihat denda anggota.
- [x] Menandai denda sebagai lunas.
- [x] Membebaskan denda oleh petugas.
- [x] Menyimpan petugas yang menerima pembayaran.

Endpoint target:

```text
GET   /api/v1/fines/me
GET   /api/v1/fines
PATCH /api/v1/fines/:id/pay
PATCH /api/v1/fines/:id/waive
```

### Tahap 7 - Dashboard dan Laporan

- [x] Total judul buku.
- [x] Total eksemplar buku.
- [x] Total anggota.
- [x] Total peminjaman aktif.
- [x] Total pengajuan pending.
- [x] Daftar keterlambatan.
- [x] Total denda belum lunas.
- [x] Laporan berdasarkan periode.
- [x] Laporan berdasarkan anggota.
- [x] Laporan berdasarkan buku.
- [x] Laporan buku paling sering dipinjam melalui laporan peminjaman.
- [x] Export laporan ke Excel.

Endpoint target:

```text
GET /api/v1/dashboard/summary
GET /api/v1/reports/loans
GET /api/v1/reports/loans/export.xlsx
GET /api/v1/reports/fines
GET /api/v1/reports/fines/export.xlsx
```

### Tahap 8 - Quality dan Deployment

- [x] Unit test service atau use case.
- [x] Integration test endpoint melalui smoke test database.
- [ ] Test authorization setiap role.
- [ ] Test transaction approval dan pengembalian.
- [ ] Dokumentasi OpenAPI.
- [ ] Logging aktivitas penting.
- [ ] Rate limit khusus endpoint login.
- [ ] Docker untuk backend dan MySQL.
- [ ] Deployment backend.

## Frontend React

Frontend React berada di folder terpisah dan menggunakan API backend:

```text
frontend/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── pages/
│   ├── services/
│   └── routes/
├── public/
└── package.json
```

Teknologi frontend:

- React + Vite.
- React Router.
- Axios.
- TanStack Query.
- React Hook Form.
- Zod.

Konfigurasi API frontend:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

Frontend tidak boleh mengakses database secara langsung. Semua data harus melalui API backend.

Status integrasi frontend:

- [x] API client dan tipe response.
- [x] Auth context dan protected route berbasis role.
- [x] Dashboard dengan data summary backend.
- [x] Katalog buku dan pengajuan peminjaman anggota.
- [x] Anggota, approval, peminjaman, pengembalian, dan denda.
- [x] Laporan dan download Excel.
- [x] Settings sistem.
