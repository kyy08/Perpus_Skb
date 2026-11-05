import { AppError } from '../errors/AppError.js';

const fieldLabels = {
  name: 'Nama',
  email: 'Email',
  password: 'Password',
  title: 'Judul buku',
  publicationYear: 'Tahun terbit',
  language: 'Bahasa',
  categoryId: 'Kategori',
  publisherId: 'Penerbit',
  authorIds: 'Penulis',
  copyCount: 'Jumlah buku',
  inventoryCode: 'Kode inventaris',
  requestedDurationDays: 'Durasi peminjaman',
  startDate: 'Tanggal mulai',
  endDate: 'Tanggal akhir',
  status: 'Status',
  value: 'Nilai'
};

function getFieldLabel(path) {
  const field = path.at(-1);
  return fieldLabels[field] || field || 'Data';
}

function formatIssue(issue) {
  const label = getFieldLabel(issue.path);

  if (issue.code === 'invalid_type') {
    return issue.received === 'undefined' || issue.received === 'null' ? `${label} wajib diisi.` : `${label} tidak valid.`;
  }

  if (issue.code === 'invalid_string' && issue.validation === 'email') {
    return `${label} tidak valid.`;
  }

  if (issue.code === 'invalid_enum_value') {
    return `${label} memiliki pilihan yang tidak valid.`;
  }

  if (issue.code === 'too_small' || issue.code === 'too_big') {
    const boundary = issue.code === 'too_small' ? `minimal ${issue.minimum}` : `maksimal ${issue.maximum}`;
    const unit = issue.type === 'string' ? ' karakter' : issue.type === 'array' ? ' pilihan' : '';
    return `${label} ${boundary}${unit}.`;
  }

  return issue.message || `${label} tidak valid.`;
}

function formatValidationDetails(error) {
  const fieldErrors = {};
  const formErrors = [];

  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join('.') : '_form';
    const message = formatIssue(issue);
    if (key === '_form') {
      formErrors.push(message);
    } else if (!fieldErrors[key]) {
      fieldErrors[key] = [message];
    } else {
      fieldErrors[key].push(message);
    }
  }

  return { formErrors, fieldErrors };
}

export function validate(schema, source = 'body') {
  return (request, response, next) => {
    const result = schema.safeParse(request[source]);

    if (!result.success) {
      next(new AppError('Periksa data yang dimasukkan', 422, formatValidationDetails(result.error), 'VALIDATION_ERROR'));
      return;
    }

    if (source === 'query') {
      for (const key of Object.keys(request.query)) {
        delete request.query[key];
      }
      Object.assign(request.query, result.data);
    } else {
      request[source] = result.data;
    }

    next();
  };
}
