import { Router } from 'express';

import healthRouter from '../routes/health.routes.js';

export function createRoutes(container) {
  const router = Router();

  router.use('/health', healthRouter);
  router.use('/v1/auth', container.authController.router());
  router.use('/v1/members', container.memberController.router());
  router.use('/v1', container.catalogController.router());
  router.use('/v1/loan-requests', container.loanController.requestRouter());
  router.use('/v1/loans', container.loanController.loanRouter());
  router.use('/v1/fines', container.fineController.router());
  router.use('/v1/dashboard', container.dashboardController.router());
  router.use('/v1/reports', container.reportController.router());
  router.use('/v1/settings', container.settingController.router());

  return router;
}
