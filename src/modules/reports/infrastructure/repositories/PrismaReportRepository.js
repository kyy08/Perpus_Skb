import { ReportRepository } from '../../domain/repositories/ReportRepository.js';

export class PrismaReportRepository extends ReportRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  listLoans({ startDate, endDate, status }) {
    return this.prisma.loan.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(startDate || endDate
          ? { borrowedAt: { ...(startDate ? { gte: startDate } : {}), ...(endDate ? { lte: endDate } : {}) } }
          : {})
      },
      orderBy: { borrowedAt: 'desc' },
      include: {
        member: { include: { user: { select: { name: true, email: true } } } },
        items: { include: { bookCopy: { include: { book: { select: { title: true } } } }, fine: true } }
      }
    });
  }

  listFines({ startDate, endDate, status }) {
    return this.prisma.fine.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(startDate || endDate
          ? { createdAt: { ...(startDate ? { gte: startDate } : {}), ...(endDate ? { lte: endDate } : {}) } }
          : {})
      },
      orderBy: { createdAt: 'desc' },
      include: {
        member: { include: { user: { select: { name: true, email: true } } } },
        loanItem: { include: { loan: { select: { loanCode: true } }, bookCopy: { include: { book: { select: { title: true } } } } } }
      }
    });
  }
}
