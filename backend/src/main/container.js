import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';

import { AuthController } from '../modules/auth/presentation/controllers/AuthController.js';
import { ChangePasswordService } from '../modules/auth/application/services/ChangePasswordService.js';
import { GetCurrentUserService } from '../modules/auth/application/services/GetCurrentUserService.js';
import { LoginService } from '../modules/auth/application/services/LoginService.js';
import { RegisterMemberService } from '../modules/auth/application/services/RegisterMemberService.js';
import { PasswordService } from '../modules/auth/infrastructure/services/PasswordService.js';
import { PrismaUserRepository } from '../modules/auth/infrastructure/repositories/PrismaUserRepository.js';
import { TokenService } from '../modules/auth/infrastructure/services/TokenService.js';

import { CatalogController } from '../modules/catalog/presentation/controllers/CatalogController.js';
import { CatalogService } from '../modules/catalog/application/services/CatalogService.js';
import { PrismaCatalogRepository } from '../modules/catalog/infrastructure/repositories/PrismaCatalogRepository.js';

import { DashboardController } from '../modules/dashboard/presentation/controllers/DashboardController.js';
import { DashboardService } from '../modules/dashboard/application/services/DashboardService.js';
import { PrismaDashboardRepository } from '../modules/dashboard/infrastructure/repositories/PrismaDashboardRepository.js';

import { FineController } from '../modules/fines/presentation/controllers/FineController.js';
import { FineService } from '../modules/fines/application/services/FineService.js';
import { PrismaFineRepository } from '../modules/fines/infrastructure/repositories/PrismaFineRepository.js';

import { LoanController } from '../modules/loans/presentation/controllers/LoanController.js';
import { LoanService } from '../modules/loans/application/services/LoanService.js';
import { PrismaLoanRepository } from '../modules/loans/infrastructure/repositories/PrismaLoanRepository.js';

import { MemberController } from '../modules/members/presentation/controllers/MemberController.js';
import { MemberService } from '../modules/members/application/services/MemberService.js';
import { PrismaMemberRepository } from '../modules/members/infrastructure/repositories/PrismaMemberRepository.js';

import { ReportController } from '../modules/reports/presentation/controllers/ReportController.js';
import { ReportService } from '../modules/reports/application/services/ReportService.js';
import { PrismaReportRepository } from '../modules/reports/infrastructure/repositories/PrismaReportRepository.js';

import { SettingController } from '../modules/settings/presentation/controllers/SettingController.js';
import { SettingService } from '../modules/settings/application/services/SettingService.js';
import { PrismaSettingRepository } from '../modules/settings/infrastructure/repositories/PrismaSettingRepository.js';

export function createContainer() {
  const userRepository = new PrismaUserRepository(prisma);
  const memberRepository = new PrismaMemberRepository(prisma);
  const catalogRepository = new PrismaCatalogRepository(prisma);
  const loanRepository = new PrismaLoanRepository(prisma);
  const fineRepository = new PrismaFineRepository(prisma);
  const settingRepository = new PrismaSettingRepository(prisma);
  const dashboardRepository = new PrismaDashboardRepository(prisma);
  const reportRepository = new PrismaReportRepository(prisma);
  const passwordService = new PasswordService(env.BCRYPT_SALT_ROUNDS);
  const tokenService = new TokenService(env.JWT_SECRET, env.JWT_EXPIRES_IN);

  const authServices = {
    registerMemberService: new RegisterMemberService({ userRepository, passwordService }),
    loginService: new LoginService({ userRepository, passwordService, tokenService }),
    getCurrentUserService: new GetCurrentUserService(),
    changePasswordService: new ChangePasswordService({ userRepository, passwordService })
  };

  const catalogService = new CatalogService({ catalogRepository });
  const memberService = new MemberService({ memberRepository });
  const loanService = new LoanService({ loanRepository, memberRepository, settingRepository });
  const fineService = new FineService({ fineRepository });
  const settingService = new SettingService({ settingRepository });
  const dashboardService = new DashboardService({ dashboardRepository });
  const reportService = new ReportService({ reportRepository });

  return {
    authController: new AuthController({ ...authServices, tokenService, userRepository }),
    memberController: new MemberController({ memberService, tokenService, userRepository }),
    catalogController: new CatalogController({ catalogService, tokenService, userRepository }),
    loanController: new LoanController({ loanService, tokenService, userRepository }),
    fineController: new FineController({ fineService, tokenService, userRepository }),
    dashboardController: new DashboardController({ dashboardService, tokenService, userRepository }),
    reportController: new ReportController({ reportService, tokenService, userRepository }),
    settingController: new SettingController({ settingService, tokenService, userRepository })
  };
}
