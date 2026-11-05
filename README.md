# Perpus SKB Kota Tegal

Sistem informasi peminjaman dan pengelolaan buku untuk SKB Kota Tegal.

Backend menggunakan Express, JavaScript, Prisma, dan MySQL. Frontend React berada di folder terpisah dan sudah terhubung ke kontrak API backend.

## Struktur Project

```text
Perpus/
├── backend/             # Backend Express
│   ├── src/
│   ├── prisma/
│   ├── tests/
│   ├── scripts/
│   └── package.json
├── frontend/            # React app
├── README.md
└── PLANNER.md
```

Struktur backend akan dikembangkan menjadi Clean Architecture per modul:

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
    ├── members/
    ├── catalog/
    ├── loans/
    ├── fines/
    ├── dashboard/
    └── reports/
```

## Teknologi

- Node.js 20+
- Express 5
- JavaScript ESM
- MySQL 8+
- Prisma ORM
- JWT dan bcryptjs
- Zod
- ExcelJS
- React + Vite untuk frontend tahap berikutnya

## Menjalankan Backend

Pastikan Node.js dan MySQL sudah terpasang, lalu buat database bernama `perpus_skb`.

Masuk ke folder backend:

```powershell
Set-Location backend
```

Salin file environment:

```powershell
Copy-Item .env.example .env
```

Sesuaikan `DATABASE_URL` dan `JWT_SECRET` di `.env`, kemudian install dependency:

```bash
npm install
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

Buat migration database:

```bash
npm run prisma:migrate -- --name init
```

Isi variable `SEED_PETUGAS_*` di `.env`, lalu jalankan seed:

```bash
npm run prisma:seed
```

Akun development pada `.env` saat ini:

```text
Petugas: petugas@skbtegal.local / Petugas12345!
```

Ganti password tersebut sebelum digunakan di luar development.

Jalankan server development:

```bash
npm run dev
```

Endpoint health check:

```text
GET http://localhost:3000/api/health
```

Prisma Studio:

```bash
npm run prisma:studio
```

Smoke test terhadap database aktif:

```bash
npm run test:smoke
```

Smoke test membuat data percobaan. Gunakan hanya pada database development.

## Arsitektur Backend

Alur request backend:

```text
Route
  -> Validator
  -> Middleware autentikasi dan role
  -> Controller
  -> Service atau Use Case
  -> Repository
  -> Prisma dan MySQL
```

Aturan bisnis berada di service atau use case. Controller hanya mengatur input dan output HTTP. Repository Prisma tidak boleh dipanggil langsung oleh controller.

## API

Endpoint fitur akan menggunakan prefix berikut:

```text
/api/v1/auth
/api/v1/members
/api/v1/categories
/api/v1/authors
/api/v1/publishers
/api/v1/books
/api/v1/book-copies
/api/v1/loan-requests
/api/v1/loans
/api/v1/fines
/api/v1/dashboard
/api/v1/reports
```

## Frontend React

Frontend akan dibuat di folder `frontend/` dan berkomunikasi dengan backend melalui REST API.

```text
Frontend: http://localhost:8080
Backend:  http://localhost:3000
API:      http://localhost:3000/api/v1
```

Environment frontend yang akan digunakan:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Dokumentasi Rencana

Detail tahapan implementasi backend, aturan bisnis, dan rencana frontend tersedia di `PLANNER.md`.

Dokumentasi endpoint backend tersedia di `backend/docs/API.md`.
