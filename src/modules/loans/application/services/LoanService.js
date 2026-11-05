import { AppError } from '../../../../shared/errors/AppError.js';

export class LoanService {
  constructor({ loanRepository, memberRepository, settingRepository }) {
    this.loanRepository = loanRepository;
    this.memberRepository = memberRepository;
    this.settingRepository = settingRepository;
  }

  async createRequest({ memberId, requestedDurationDays, bookIds, notes }) {
    const member = await this.memberRepository.findById(memberId);
    if (!member || member.status !== 'ACTIVE') {
      throw new AppError('Anggota tidak aktif', 403, null, 'MEMBER_INACTIVE');
    }

    const maxLoans = await this.getNumberSetting('max_active_loans', 2);
    const maxDurationDays = await this.getNumberSetting('max_loan_duration_days', 14);
    const activeItems = await this.loanRepository.countActiveItems(memberId);
    const pendingItems = await this.loanRepository.countPendingItems(memberId);

    if (activeItems + pendingItems + bookIds.length > maxLoans) {
      throw new AppError(`Maksimal peminjaman adalah ${maxLoans} buku`, 422, null, 'LOAN_LIMIT_REACHED');
    }

    if (requestedDurationDays > maxDurationDays) {
      throw new AppError(`Durasi maksimal peminjaman adalah ${maxDurationDays} hari`, 422, null, 'DURATION_LIMIT_REACHED');
    }

    if (!(await this.loanRepository.hasAvailableCopies(bookIds))) {
      throw new AppError('Salah satu buku tidak tersedia', 409, null, 'BOOK_UNAVAILABLE');
    }

    return this.loanRepository.createRequest({ memberId, requestedDurationDays, bookIds, notes });
  }

  async listRequests(input) {
    return this.loanRepository.listRequests(input);
  }

  async approveRequest(id, approvedBy) {
    const maxDurationDays = await this.getNumberSetting('max_loan_duration_days', 14);
    const result = await this.loanRepository.approveRequest(id, approvedBy, maxDurationDays);

    if (!result) {
      throw new AppError('Pengajuan tidak ditemukan atau sudah diproses', 409, null, 'REQUEST_ALREADY_PROCESSED');
    }

    if (result.unavailable) {
      throw new AppError('Eksemplar buku sudah tidak tersedia', 409, null, 'BOOK_UNAVAILABLE');
    }

    return result;
  }

  async rejectRequest(id, reviewedBy, rejectionReason) {
    const result = await this.loanRepository.rejectRequest(id, reviewedBy, rejectionReason);

    if (!result) {
      throw new AppError('Pengajuan tidak ditemukan atau sudah diproses', 409, null, 'REQUEST_ALREADY_PROCESSED');
    }

    return result;
  }

  async cancelRequest(id, memberId) {
    const result = await this.loanRepository.cancelRequest(id, memberId);

    if (!result) {
      throw new AppError('Pengajuan tidak ditemukan atau sudah diproses', 409, null, 'REQUEST_ALREADY_PROCESSED');
    }

    return result;
  }

  listLoans(input) {
    return this.loanRepository.listLoans(input);
  }

  async getLoan(id) {
    const loan = await this.loanRepository.findLoan(id);
    if (!loan) {
      throw new AppError('Peminjaman tidak ditemukan', 404, null, 'LOAN_NOT_FOUND');
    }
    return loan;
  }

  async returnItems(input) {
    const loan = await this.getLoan(input.loanId);
    if (loan.status === 'RETURNED' || loan.status === 'CANCELLED') {
      throw new AppError('Peminjaman sudah selesai', 409, null, 'LOAN_ALREADY_COMPLETED');
    }

    if (input.itemIds && !input.itemIds.some((itemId) => loan.items.some((item) => item.id === itemId && !item.returnedAt))) {
      throw new AppError('Detail buku tidak ditemukan atau sudah dikembalikan', 409, null, 'LOAN_ITEM_ALREADY_RETURNED');
    }

    const finePerDay = await this.settingRepository.getValue('fine_per_day') || '1000';
    const result = await this.loanRepository.returnItems({ ...input, finePerDay });
    return result;
  }

  async getNumberSetting(key, fallback) {
    const value = await this.settingRepository.getValue(key);
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
