import { createApp } from '../src/main/app.js';
import { createContainer } from '../src/main/container.js';
import { env } from '../src/config/env.js';
import { prisma } from '../src/config/prisma.js';

function uniqueValue(prefix) {
  return `${prefix}-${Date.now()}`;
}

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {})
    }
  });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('json') ? await response.json() : await response.arrayBuffer();

  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} failed (${response.status}): ${JSON.stringify(body)}`);
  }

  return { response, body };
}

function bearer(token) {
  return { Authorization: `Bearer ${token}` };
}

async function run() {
  const server = createApp(createContainer()).listen(0);
  const baseUrl = `http://localhost:${server.address().port}/api`;
  const staffEmail = process.env.SEED_PETUGAS_EMAIL;
  const staffPassword = process.env.SEED_PETUGAS_PASSWORD;
  const memberEmail = `${uniqueValue('member')}@example.com`;

  try {
    const staffLogin = await request(baseUrl, '/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: staffEmail, password: staffPassword })
    });
    const staffToken = staffLogin.body.data.token;

    const category = await request(baseUrl, '/v1/categories', {
      method: 'POST',
      headers: bearer(staffToken),
      body: JSON.stringify({ name: uniqueValue('Kategori') })
    });
    const author = await request(baseUrl, '/v1/authors', {
      method: 'POST',
      headers: bearer(staffToken),
      body: JSON.stringify({ name: uniqueValue('Penulis') })
    });
    const publisher = await request(baseUrl, '/v1/publishers', {
      method: 'POST',
      headers: bearer(staffToken),
      body: JSON.stringify({ name: uniqueValue('Penerbit') })
    });
    const book = await request(baseUrl, '/v1/books', {
      method: 'POST',
      headers: bearer(staffToken),
      body: JSON.stringify({
        title: uniqueValue('Buku'),
        categoryId: category.body.data.id,
        authorIds: [author.body.data.id],
        publisherId: publisher.body.data.id
      })
    });
    const copy = await request(baseUrl, `/v1/books/${book.body.data.id}/copies`, {
      method: 'POST',
      headers: bearer(staffToken),
      body: JSON.stringify({ inventoryCode: uniqueValue('INV') })
    });

    const registration = await request(baseUrl, '/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Anggota Smoke Test', email: memberEmail, password: 'Member12345!' })
    });
    const memberLogin = await request(baseUrl, '/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: memberEmail, password: 'Member12345!' })
    });
    const memberToken = memberLogin.body.data.token;
    const memberId = registration.body.data.member.id;

    const loanRequest = await request(baseUrl, '/v1/loan-requests', {
      method: 'POST',
      headers: bearer(memberToken),
      body: JSON.stringify({ bookIds: [book.body.data.id], requestedDurationDays: 7 })
    });
    const approvedLoan = await request(baseUrl, `/v1/loan-requests/${loanRequest.body.data.id}/approve`, {
      method: 'PATCH',
      headers: bearer(staffToken)
    });
    const loanId = approvedLoan.body.data.id;
    const loanItemId = approvedLoan.body.data.items[0].id;
    const returnedLoan = await request(baseUrl, `/v1/loans/${loanId}/items/${loanItemId}/return`, {
      method: 'PATCH',
      headers: bearer(staffToken),
      body: JSON.stringify({ returnStatus: 'ON_TIME' })
    });
    const dashboard = await request(baseUrl, '/v1/dashboard/summary', {
      headers: bearer(staffToken)
    });
    const report = await request(baseUrl, '/v1/reports/loans/export.xlsx', {
      headers: bearer(staffToken)
    });

    console.log(JSON.stringify({
      memberId,
      bookId: book.body.data.id,
      copyId: copy.body.data.id,
      loanId,
      returnedStatus: returnedLoan.body.data.status,
      activeLoans: dashboard.body.data.activeLoans,
      reportBytes: report.body.byteLength
    }, null, 2));
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
