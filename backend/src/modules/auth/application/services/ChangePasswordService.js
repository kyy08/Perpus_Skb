import { AppError } from '../../../../shared/errors/AppError.js';

export class ChangePasswordService {
  constructor({ userRepository, passwordService }) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
  }

  async execute({ userId, currentPassword, newPassword }) {
    const user = await this.userRepository.findAuthUserById(userId);
    const isValid = user && (await this.passwordService.compare(currentPassword, user.passwordHash));

    if (!user || !isValid) {
      throw new AppError('Password saat ini salah', 400, null, 'INVALID_CURRENT_PASSWORD');
    }

    const passwordHash = await this.passwordService.hash(newPassword);
    await this.userRepository.updatePassword(userId, passwordHash);
  }
}
