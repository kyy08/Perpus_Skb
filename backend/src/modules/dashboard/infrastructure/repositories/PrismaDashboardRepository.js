import { DashboardRepository } from '../../domain/repositories/DashboardRepository.js';

export class PrismaDashboardRepository extends DashboardRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async getSummary() {
    const [
      totalBooks,
      totalCopies,
      availableCopies,
      borrowedCopies,
      totalMembers,
      pendingRequests,
      activeLoans,
      overdueLoans,
      unpaidFines
    ] = await Promise.all([
      this.prisma.book.count({ where: { deletedAt: null } }),
      this.prisma.bookCopy.count(),
      this.prisma.bookCopy.count({ where: { availabilityStatus: 'AVAILABLE' } }),
      this.prisma.bookCopy.count({ where: { availabilityStatus: 'BORROWED' } }),
      this.prisma.member.count({ where: { status: 'ACTIVE' } }),
      this.prisma.loanRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.loan.count({ where: { status: { in: ['BORROWED', 'PARTIALLY_RETURNED'] } } }),
      this.prisma.loan.count({ where: { status: { in: ['BORROWED', 'PARTIALLY_RETURNED'] }, dueAt: { lt: new Date() } } }),
      this.prisma.fine.aggregate({ where: { status: 'UNPAID' }, _sum: { amount: true }, _count: { id: true } })
    ]);

    return {
      totalBooks,
      totalCopies,
      availableCopies,
      borrowedCopies,
      totalMembers,
      pendingRequests,
      activeLoans,
      overdueLoans,
      unpaidFines: {
        count: unpaidFines._count.id,
        amount: unpaidFines._sum.amount || 0
      }
    };
  }
}
