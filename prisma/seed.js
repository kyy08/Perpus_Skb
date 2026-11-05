import 'dotenv/config';
import bcrypt from 'bcryptjs';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const requiredEnvironment = [
  'SEED_PETUGAS_EMAIL',
  'SEED_PETUGAS_PASSWORD'
];

for (const key of requiredEnvironment) {
  if (!process.env[key]) {
    throw new Error(`${key} wajib diisi sebelum menjalankan seed`);
  }
}

async function upsertStaff({ email, password, name, role }) {
  const passwordHash = await bcrypt.hash(password, 12);

  return prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { name, passwordHash, role, isActive: true },
    create: {
      email: email.toLowerCase(),
      name,
      passwordHash,
      role,
      isActive: true
    }
  });
}

async function seed() {
  await upsertStaff({
    email: process.env.SEED_PETUGAS_EMAIL,
    password: process.env.SEED_PETUGAS_PASSWORD,
    name: 'Petugas Perpustakaan',
    role: 'PETUGAS'
  });

  const settings = [
    ['max_active_loans', '2', 'Jumlah maksimal buku aktif per anggota'],
    ['max_loan_duration_days', '14', 'Durasi maksimal peminjaman dalam hari'],
    ['fine_per_day', '1000', 'Denda per buku per hari']
  ];

  for (const [settingKey, settingValue, description] of settings) {
    await prisma.systemSetting.upsert({
      where: { settingKey },
      update: { settingValue, description },
      create: { settingKey, settingValue, description }
    });
  }
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
