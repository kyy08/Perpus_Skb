import { isPrismaConflictError, isPrismaNotFoundError } from '../shared/errors/AppError.js';

export function notFoundHandler(request, response) {
  response.status(404).json({
    success: false,
    message: `Route ${request.method} ${request.originalUrl} tidak ditemukan`
  });
}

export function errorHandler(error, request, response, next) {
  console.error(error);

  if (response.headersSent) {
    next(error);
    return;
  }

  const isNotFound = isPrismaNotFoundError(error);
  const isConflict = isPrismaConflictError(error);
  const isFileTooLarge = error?.code === 'LIMIT_FILE_SIZE';
  const statusCode = isFileTooLarge ? 422 : isNotFound || isConflict ? (isNotFound ? 404 : 409) : error.statusCode || 500;
  const message = isNotFound
    ? 'Data tidak ditemukan'
    : isFileTooLarge
      ? 'Ukuran cover maksimal 5 MB'
    : error?.code === 'P2003'
      ? 'Data tidak dapat dihapus karena masih digunakan oleh data lain'
      : error?.code === 'P2002'
        ? 'Data sudah digunakan dan tidak boleh duplikat'
        : error.statusCode
          ? error.message
          : 'Terjadi kesalahan pada server';
  const code = isNotFound
    ? 'DATA_NOT_FOUND'
    : isFileTooLarge
      ? 'FILE_TOO_LARGE'
    : error?.code === 'P2003'
      ? 'RELATION_CONFLICT'
      : error?.code === 'P2002'
        ? 'DUPLICATE_DATA'
        : error.code || 'INTERNAL_SERVER_ERROR';

  response.status(statusCode).json({
    success: false,
    message,
    code,
    ...(error.details ? { details: error.details } : {})
  });
}
