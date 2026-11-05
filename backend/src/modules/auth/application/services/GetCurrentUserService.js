import { AppError } from '../../../../shared/errors/AppError.js';
import { sanitizeUser } from './sanitize-user.js';

export class GetCurrentUserService {
  execute(user) {
    if (!user) {
      throw new AppError('Pengguna tidak ditemukan', 404, null, 'USER_NOT_FOUND');
    }

    return sanitizeUser(user);
  }
}
