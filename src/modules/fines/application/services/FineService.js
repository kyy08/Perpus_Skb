import { AppError } from '../../../../shared/errors/AppError.js';

export class FineService {
  constructor({ fineRepository }) {
    this.fineRepository = fineRepository;
  }

  list(input) {
    return this.fineRepository.list(input);
  }

  async pay(id, paidBy) {
    const result = await this.fineRepository.markPaid(id, paidBy);
    if (!result) {
      throw new AppError('Denda tidak ditemukan atau sudah diproses', 409, null, 'FINE_ALREADY_PROCESSED');
    }
    return result;
  }

  async waive(id, paidBy, notes) {
    const result = await this.fineRepository.waive(id, paidBy, notes);
    if (!result) {
      throw new AppError('Denda tidak ditemukan atau sudah diproses', 409, null, 'FINE_ALREADY_PROCESSED');
    }
    return result;
  }
}
