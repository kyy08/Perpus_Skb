import { AppError } from '../../../../shared/errors/AppError.js';
import { normalizeEmail, toNullable } from '../../../../shared/utils/normalize.js';

export class MemberService {
  constructor({ memberRepository }) {
    this.memberRepository = memberRepository;
  }

  list(input) {
    return this.memberRepository.list(input);
  }

  async getById(id) {
    const member = await this.memberRepository.findById(id);

    if (!member) {
      throw new AppError('Anggota tidak ditemukan', 404, null, 'MEMBER_NOT_FOUND');
    }

    return member;
  }

  async getByUserId(userId) {
    const member = await this.memberRepository.findByUserId(userId);

    if (!member) {
      throw new AppError('Profil anggota tidak ditemukan', 404, null, 'MEMBER_NOT_FOUND');
    }

    return member;
  }

  async update(id, input) {
    await this.getById(id);

    return this.memberRepository.update(id, {
      ...input,
      email: input.email ? normalizeEmail(input.email) : undefined,
      phone: toNullable(input.phone),
      address: toNullable(input.address),
      birthDate: input.birthDate || null
    });
  }

  async updateStatus(id, status) {
    await this.getById(id);
    return this.memberRepository.updateStatus(id, status);
  }
}
