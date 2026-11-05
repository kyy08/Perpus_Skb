import { AppError } from '../../../../shared/errors/AppError.js';
import { normalizeEmail } from '../../../../shared/utils/normalize.js';
import { sanitizeUser } from './sanitize-user.js';

export class LoginService {
  constructor({ userRepository, passwordService, tokenService }) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
    this.tokenService = tokenService;
  }

  async execute({ email, password }) {
    const user = await this.userRepository.findByEmail(normalizeEmail(email));
    const isPasswordValid = user && (await this.passwordService.compare(password, user.passwordHash));

    if (!user || !isPasswordValid) {
      throw new AppError('Email atau password salah', 401, null, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive || (user.member && user.member.status !== 'ACTIVE')) {
      throw new AppError('Akun tidak aktif', 403, null, 'ACCOUNT_INACTIVE');
    }

    await this.userRepository.updateLastLogin(user.id);

    return {
      token: this.tokenService.sign(user),
      user: sanitizeUser(user)
    };
  }
}
