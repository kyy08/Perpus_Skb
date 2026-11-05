import { MemberRepository } from '../../domain/repositories/MemberRepository.js';

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isActive: true
};

export class PrismaMemberRepository extends MemberRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async list({ search, status, skip, limit }) {
    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { memberCode: { contains: search } },
              { user: { name: { contains: search } } },
              { user: { email: { contains: search } } }
            ]
          }
        : {})
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: publicUserSelect } }
      }),
      this.prisma.member.count({ where })
    ]);

    return { items, total };
  }

  findById(id) {
    return this.prisma.member.findUnique({
      where: { id },
      include: { user: { select: publicUserSelect } }
    });
  }

  findByUserId(userId) {
    return this.prisma.member.findUnique({
      where: { userId },
      include: { user: { select: publicUserSelect } }
    });
  }

  update(id, data) {
    const { name, email, phone, address, birthDate } = data;

    return this.prisma.$transaction(async (transaction) => {
      const member = await transaction.member.update({
        where: { id },
        data: {
          address,
          birthDate
        }
      });

      await transaction.user.update({
        where: { id: member.userId },
        data: { name, email, phone }
      });

      return transaction.member.findUnique({
        where: { id },
        include: { user: { select: publicUserSelect } }
      });
    });
  }

  updateStatus(id, status) {
    return this.prisma.member.update({
      where: { id },
      data: { status },
      include: { user: { select: publicUserSelect } }
    });
  }
}
