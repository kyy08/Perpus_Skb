import { describe, expect, it, vi } from 'vitest';

import { LoanService } from '../../src/modules/loans/application/services/LoanService.js';

describe('LoanService', () => {
  it('rejects a request that exceeds the active loan limit', async () => {
    const service = new LoanService({
      memberRepository: { findById: vi.fn().mockResolvedValue({ id: 1, status: 'ACTIVE' }) },
      settingRepository: { getValue: vi.fn().mockImplementation(async (key) => (key === 'max_active_loans' ? '2' : '14')) },
      loanRepository: {
        countActiveItems: vi.fn().mockResolvedValue(1),
        countPendingItems: vi.fn().mockResolvedValue(1),
        hasAvailableCopies: vi.fn(),
        createRequest: vi.fn()
      }
    });

    await expect(service.createRequest({ memberId: 1, requestedDurationDays: 7, bookIds: [1] })).rejects.toMatchObject({
      statusCode: 422,
      code: 'LOAN_LIMIT_REACHED'
    });
  });

  it('rejects a request when one of the books is unavailable', async () => {
    const loanRepository = {
      countActiveItems: vi.fn().mockResolvedValue(0),
      countPendingItems: vi.fn().mockResolvedValue(0),
      hasAvailableCopies: vi.fn().mockResolvedValue(false),
      createRequest: vi.fn()
    };
    const service = new LoanService({
      memberRepository: { findById: vi.fn().mockResolvedValue({ id: 1, status: 'ACTIVE' }) },
      settingRepository: { getValue: vi.fn().mockResolvedValue('14') },
      loanRepository
    });

    await expect(service.createRequest({ memberId: 1, requestedDurationDays: 7, bookIds: [1] })).rejects.toMatchObject({
      statusCode: 409,
      code: 'BOOK_UNAVAILABLE'
    });
  });
});
