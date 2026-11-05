import { AppError } from '../../../../shared/errors/AppError.js';

export class SettingService {
  constructor({ settingRepository }) {
    this.settingRepository = settingRepository;
  }

  list() {
    return this.settingRepository.list();
  }

  async update(key, value, updatedBy) {
    if (!['max_active_loans', 'max_loan_duration_days', 'fine_per_day'].includes(key)) {
      throw new AppError('Setting tidak dapat diubah', 400, null, 'SETTING_NOT_ALLOWED');
    }

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue < 0 || (key !== 'fine_per_day' && !Number.isInteger(numericValue))) {
      throw new AppError('Nilai setting harus berupa angka yang valid', 422, null, 'INVALID_SETTING_VALUE');
    }

    return this.settingRepository.update(key, numericValue, updatedBy);
  }
}
