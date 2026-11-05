export class AppError extends Error {
  constructor(message, statusCode = 500, details = null, code = 'APP_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
  }
}

export function isPrismaNotFoundError(error) {
  return error?.code === 'P2025';
}

export function isPrismaConflictError(error) {
  return error?.code === 'P2002' || error?.code === 'P2003';
}
