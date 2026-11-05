import { AppError } from '../../../../shared/errors/AppError.js';
import { normalizeEmail } from '../../../../shared/utils/normalize.js';
import { sanitizeUser } from './sanitize-user.js';

export class RegisterMemberService {
  constructor({ userRepository, passwordService }) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
  }

  async execute(input) {
    const email = normalizeEmail(input.email);
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError('Email sudah digunakan', 409, null, 'EMAIL_ALREADY_USED');
    }

    const passwordHash = await this.passwordService.hash(input.password);
    const user = await this.userRepository.createMember({
      ...input,
      email,
      passwordHash
    });

    return sanitizeUser(user);
  }
}
