import app from './app.js';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { createContainer } from './container.js';

const server = app(createContainer()).listen(env.PORT, () => {
  console.log(`API berjalan pada http://localhost:${env.PORT}`);
});

async function shutdown(signal) {
  console.log(`${signal} diterima, menghentikan server...`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
