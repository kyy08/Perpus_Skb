import { Prisma } from '@prisma/client';

import { LoanRepository } from '../../domain/repositories/LoanRepository.js';
import { getLateDays } from '../../../../shared/utils/date.js';

function createLoanCode() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LOAN-${timestamp}-${random}`;
}

const loanInclude = {
  member: { include: { user: { select: { name: true, email: true } } } },
  request: true,
  approver: { select: { id: true, name: true } },
  items: {
    include: {
      bookCopy: { include: { book: { select: { id: true, title: true } } } },
      fine: true
    },
    orderBy: { id: 'asc' }
  }
};

export class PrismaLoanRepository extends LoanRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  countActiveItems(memberId) {
    return this.prisma.loanItem.count({
      where: {
        returnedAt: null,
        loan: {
          memberId,
          status: { in: ['BORROWED', 'PARTIALLY_RETURNED'] }
        }
      }
    });
  }

  async countPendingItems(memberId) {
    const requests = await this.prisma.loanRequest.findMany({
      where: { memberId, status: 'PENDING' },
      select: { items: { select: { quantity: true } } }
    });

    return requests.reduce(
      (total, request) => total + request.items.reduce((requestTotal, item) => requestTotal + item.quantity, 0),
      0
    );
  }

  async hasAvailableCopies(bookIds) {
    const counts = await this.prisma.bookCopy.groupBy({
      by: ['bookId'],
      where: { bookId: { in: bookIds }, availabilityStatus: 'AVAILABLE' },
      _count: { id: true }
    });
    const countMap = new Map(counts.map((item) => [item.bookId, item._count.id]));
    return bookIds.every((bookId) => (countMap.get(bookId) || 0) > 0);
  }

  createRequest({ memberId, requestedDurationDays, bookIds, notes }) {
    return this.prisma.loanRequest.create({
      data: {
        memberId,
        requestedDurationDays,
        notes: notes || null,
        items: {
          create: bookIds.map((bookId) => ({ bookId, quantity: 1 }))
        }
      },
      include: { items: { include: { book: true } } }
    });
  }

  listRequests({ memberId, status, skip, limit }) {
    const where = {
      ...(memberId ? { memberId } : {}),
      ...(status ? { status } : {})
    };

    return this.prisma.$transaction([
      this.prisma.loanRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          member: { include: { user: { select: { name: true, email: true } } } },
          reviewer: { select: { id: true, name: true } },
          items: { include: { book: { select: { id: true, title: true } } } },
          loan: { select: { id: true, loanCode: true, status: true } }
        }
      }),
      this.prisma.loanRequest.count({ where })
    ]).then(([items, total]) => ({ items, total }));
  }

  findRequest(id) {
    return this.prisma.loanRequest.findUnique({
      where: { id },
      include: {
        member: true,
        items: { include: { book: true } },
        loan: true
      }
    });
  }

  async approveRequest(id, approvedBy, maxDurationDays) {
    return this.prisma.$transaction(async (transaction) => {
      const request = await transaction.loanRequest.findUnique({
        where: { id },
        include: { items: true, member: true }
      });

      if (!request || request.status !== 'PENDING') {
        return null;
      }

      const durationDays = Math.min(request.requestedDurationDays, maxDurationDays);
      const selectedCopyIds = [];

      for (const item of request.items) {
        const copies = await transaction.$queryRaw(Prisma.sql`
          SELECT id
          FROM book_copies
          WHERE book_id = ${item.bookId}
            AND availability_status = 'AVAILABLE'
          ORDER BY inventory_code ASC
          LIMIT ${item.quantity}
          FOR UPDATE
        `);

        if (copies.length < item.quantity) {
          return { unavailable: true };
        }

        selectedCopyIds.push(...copies.map((copy) => Number(copy.id)));
      }

      await transaction.bookCopy.updateMany({
        where: { id: { in: selectedCopyIds } },
        data: { availabilityStatus: 'BORROWED' }
      });

      const borrowedAt = new Date();
      const dueAt = new Date(borrowedAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
      const loan = await transaction.loan.create({
        data: {
          loanCode: createLoanCode(),
          loanRequestId: id,
          memberId: request.memberId,
          approvedBy,
          borrowedAt,
          dueAt,
          items: { create: selectedCopyIds.map((bookCopyId) => ({ bookCopyId })) }
        },
        include: loanInclude
      });

      await transaction.loanRequest.update({
        where: { id },
        data: { status: 'APPROVED', reviewedBy: approvedBy, reviewedAt: new Date() }
      });

      return loan;
    });
  }

  async rejectRequest(id, reviewedBy, rejectionReason) {
    const request = await this.prisma.loanRequest.findUnique({ where: { id } });

    if (!request || request.status !== 'PENDING') {
      return null;
    }

    return this.prisma.loanRequest.update({
      where: { id },
      data: { status: 'REJECTED', reviewedBy, reviewedAt: new Date(), rejectionReason }
    });
  }

  async cancelRequest(id, memberId) {
    const result = await this.prisma.loanRequest.updateMany({
      where: { id, memberId, status: 'PENDING' },
      data: { status: 'CANCELLED' }
    });

    if (result.count === 0) return null;

    return this.prisma.loanRequest.findUnique({
      where: { id },
      include: { items: { include: { book: { select: { id: true, title: true } } } } }
    });
  }

  async listLoans({ memberId, status, overdueOnly, skip, limit }) {
    const now = new Date();
    const where = {
      ...(memberId ? { memberId } : {}),
      ...(status ? { status } : {}),
      ...(overdueOnly ? { dueAt: { lt: now }, status: { in: ['BORROWED', 'PARTIALLY_RETURNED'] } } : {})
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.loan.findMany({ where, skip, take: limit, orderBy: { borrowedAt: 'desc' }, include: loanInclude }),
      this.prisma.loan.count({ where })
    ]);

    return { items, total };
  }

  findLoan(id) {
    return this.prisma.loan.findUnique({ where: { id }, include: loanInclude });
  }

  async returnItems({ loanId, itemIds, returnStatus, lateDays, notes, finePerDay }) {
    return this.prisma.$transaction(async (transaction) => {
      const loan = await transaction.loan.findUnique({
        where: { id: loanId },
        include: { items: { include: { bookCopy: true } } }
      });

      if (!loan) {
        return null;
      }

      const targetItems = loan.items.filter((item) => !item.returnedAt && (!itemIds || itemIds.includes(item.id)));
      const returnedAt = new Date();
      const computedLateDays = returnStatus === 'LATE' ? Math.max(Number(lateDays) || 0, 0) : getLateDays(loan.dueAt, returnedAt);

      for (const item of targetItems) {
        const condition = item.bookCopy.conditionStatus;
        const status = returnStatus === 'LATE' ? 'LATE' : 'ON_TIME';
        const availabilityStatus = 'AVAILABLE';

        await transaction.loanItem.update({
          where: { id: item.id },
          data: { returnedAt, notes: notes || null }
        });

        await transaction.bookCopy.update({
          where: { id: item.bookCopyId },
          data: { conditionStatus: condition, availabilityStatus }
        });

        if (status === 'LATE' && computedLateDays > 0) {
          await transaction.fine.create({
            data: {
              loanItemId: item.id,
              memberId: loan.memberId,
              lateDays: computedLateDays,
              amount: computedLateDays * Number(finePerDay),
              status: 'UNPAID'
            }
          });
        }
      }

      const remainingItems = await transaction.loanItem.count({ where: { loanId, returnedAt: null } });
      const status = remainingItems === 0 ? 'RETURNED' : 'PARTIALLY_RETURNED';

      await transaction.loan.update({
        where: { id: loanId },
        data: { status, completedAt: remainingItems === 0 ? returnedAt : null }
      });

      return transaction.loan.findUnique({ where: { id: loanId }, include: loanInclude });
    });
  }
}
