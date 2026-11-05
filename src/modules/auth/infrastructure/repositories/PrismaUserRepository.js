import { UserRepository } from '../../domain/repositories/UserRepository.js';

function createMemberCode() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MEM-${timestamp}-${random}`;
}

export class PrismaUserRepository extends UserRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  findByEmail(email) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { member: true }
    });
  }

  findAuthUserById(id) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { member: true }
    });
  }

  async createMember({ name, email, passwordHash, phone, address, birthDate }) {
    return this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          name,
          email,
          passwordHash,
          phone: phone || null,
          role: 'ANGGOTA',
          member: {
            create: {
              memberCode: createMemberCode(),
              address: address || null,
              birthDate: birthDate || null,
              joinedAt: new Date()
            }
          }
        },
        include: { member: true }
      });

      return user;
    });
  }

  updatePassword(id, passwordHash) {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash }
    });
  }

  updateLastLogin(id) {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() }
    });
  }
}
