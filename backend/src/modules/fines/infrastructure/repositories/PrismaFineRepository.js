import { FineRepository } from '../../domain/repositories/FineRepository.js';

const fineInclude = {
  member: { include: { user: { select: { id: true, name: true, email: true } } } },
  loanItem: {
    include: {
      loan: { select: { id: true, loanCode: true, borrowedAt: true, dueAt: true } },
      bookCopy: { include: { book: { select: { id: true, title: true } } } }
    }
  },
  payer: { select: { id: true, name: true } }
};

export class PrismaFineRepository extends FineRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async list({ memberId, status, skip, limit }) {
    const where = {
      ...(memberId ? { memberId } : {}),
      ...(status ? { status } : {})
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.fine.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: fineInclude }),
      this.prisma.fine.count({ where })
    ]);

    return { items, total };
  }

  findById(id) {
    return this.prisma.fine.findUnique({ where: { id }, include: fineInclude });
  }

  async markPaid(id, paidBy) {
    const fine = await this.prisma.fine.findUnique({ where: { id } });
    if (!fine || fine.status !== 'UNPAID') {
      return null;
    }

    return this.prisma.fine.update({
      where: { id },
      data: { status: 'PAID', paidAt: new Date(), paidBy },
      include: fineInclude
    });
  }

  async waive(id, paidBy, notes) {
    const fine = await this.prisma.fine.findUnique({ where: { id } });
    if (!fine || fine.status !== 'UNPAID') {
      return null;
    }

    return this.prisma.fine.update({
      where: { id },
      data: { status: 'WAIVED', paidAt: new Date(), paidBy, notes: notes || null },
      include: fineInclude
    });
  }
}
