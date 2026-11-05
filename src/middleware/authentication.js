import { AppError } from '../shared/errors/AppError.js';

export function createAuthenticationMiddleware({ tokenService, userRepository }) {
  return async (request, response, next) => {
    try {
      const authorization = request.headers.authorization;

      if (!authorization?.startsWith('Bearer ')) {
        throw new AppError('Token autentikasi diperlukan', 401, null, 'AUTH_REQUIRED');
      }

      const token = authorization.substring(7);
      const payload = tokenService.verify(token);
      const user = await userRepository.findAuthUserById(payload.userId);

      if (!user || !user.isActive) {
        throw new AppError('Akun tidak aktif atau tidak ditemukan', 401, null, 'AUTH_INVALID');
      }

      request.user = user;
      next();
    } catch (error) {
      next(error instanceof AppError ? error : new AppError('Token autentikasi tidak valid', 401, null, 'AUTH_INVALID'));
    }
  };
}

export function authorize(...allowedRoles) {
  return (request, response, next) => {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      next(new AppError('Anda tidak memiliki hak akses', 403, null, 'FORBIDDEN'));
      return;
    }

    next();
  };
}
