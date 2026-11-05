import { SettingRepository } from '../../domain/repositories/SettingRepository.js';

export class PrismaSettingRepository extends SettingRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async getValue(key) {
    const setting = await this.prisma.systemSetting.findUnique({ where: { settingKey: key } });
    return setting?.settingValue ?? null;
  }

  list() {
    return this.prisma.systemSetting.findMany({ orderBy: { settingKey: 'asc' } });
  }

  update(key, value, updatedBy) {
    return this.prisma.systemSetting.upsert({
      where: { settingKey: key },
      create: { settingKey: key, settingValue: String(value), updatedBy },
      update: { settingValue: String(value), updatedBy }
    });
  }
}
