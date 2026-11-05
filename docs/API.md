# API Perpus SKB Kota Tegal

Base URL: `http://localhost:3000/api/v1`

Semua response JSON menggunakan format:

```json
{
  "success": true,
  "data": {}
}
```

Endpoint yang membutuhkan autentikasi menggunakan header:

```text
Authorization: Bearer <token>
```

## Auth

| Method | Endpoint | Akses |
|---|---|---|
| POST | `/auth/register` | Publik |
| POST | `/auth/login` | Publik |
| GET | `/auth/me` | Semua pengguna |
| PATCH | `/auth/password` | Semua pengguna |

Contoh registrasi:

```json
{
  "name": "Nama Anggota",
  "email": "anggota@example.com",
  "password": "password123",
  "phone": "08123456789",
  "address": "Kota Tegal"
}
```

## Katalog

| Method | Endpoint | Akses |
|---|---|---|
| GET | `/books` | Publik |
| POST | `/books` | Petugas |
| GET | `/books/:id` | Publik |
| PATCH | `/books/:id` | Petugas |
| DELETE | `/books/:id` | Petugas |
| GET | `/books/:id/copies` | Publik |
| POST | `/books/:id/copies` | Petugas |
| PATCH | `/book-copies/:id` | Petugas |
| GET/POST/PATCH/DELETE | `/categories` | Publik/Petugas |
| GET/POST/PATCH/DELETE | `/authors` | Publik/Petugas |
| GET/POST/PATCH/DELETE | `/publishers` | Publik/Petugas |

Query `GET /books` mendukung `search`, `categoryId`, `availableOnly`, `page`, dan `limit`.

## Anggota

| Method | Endpoint | Akses |
|---|---|---|
| GET | `/members/me` | Anggota |
| GET | `/members` | Petugas |
| GET | `/members/:id` | Petugas |
| PATCH | `/members/:id` | Petugas |
| PATCH | `/members/:id/status` | Petugas |

## Peminjaman

| Method | Endpoint | Akses |
|---|---|---|
| POST | `/loan-requests` | Anggota |
| GET | `/loan-requests/me` | Anggota |
| GET | `/loan-requests` | Petugas |
| PATCH | `/loan-requests/:id/approve` | Petugas |
| PATCH | `/loan-requests/:id/reject` | Petugas |
| GET | `/loans/me` | Anggota |
| GET | `/loans` | Petugas |
| GET | `/loans/overdue` | Petugas |
| GET | `/loans/:id` | Pengguna terkait/Petugas |
| PATCH | `/loans/:id/items/:itemId/return` | Petugas |
| PATCH | `/loans/:id/return` | Petugas |

Contoh pengajuan maksimal dua buku:

```json
{
  "bookIds": [1, 2],
  "requestedDurationDays": 7,
  "notes": "Untuk kegiatan belajar"
}
```

## Denda

| Method | Endpoint | Akses |
|---|---|---|
| GET | `/fines/me` | Anggota |
| GET | `/fines` | Petugas |
| PATCH | `/fines/:id/pay` | Petugas |
| PATCH | `/fines/:id/waive` | Petugas |

## Dashboard, Settings, dan Reports

| Method | Endpoint | Akses |
|---|---|---|
| GET | `/dashboard/summary` | Petugas |
| GET | `/settings` | Petugas |
| PATCH | `/settings/:key` | Petugas |
| GET | `/reports/loans` | Petugas |
| GET | `/reports/loans/export.xlsx` | Petugas |
| GET | `/reports/fines` | Petugas |
| GET | `/reports/fines/export.xlsx` | Petugas |

Report mendukung query `startDate`, `endDate`, dan `status`.
