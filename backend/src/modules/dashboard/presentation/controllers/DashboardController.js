import { Router } from 'express';

import { authorize, createAuthenticationMiddleware } from '../../../../middleware/authentication.js';
import { asyncHandler } from '../../../../shared/http/async-handler.js';
import { sendSuccess } from '../../../../shared/http/response.js';

export class DashboardController {
  constructor({ dashboardService, tokenService, userRepository }) {
    this.dashboardService = dashboardService;
    this.authentication = createAuthenticationMiddleware({ tokenService, userRepository });
  }

  router() {
    const router = Router();
    router.get('/summary', this.authentication, authorize('PETUGAS'), asyncHandler(async (request, response) => {
      sendSuccess(response, await this.dashboardService.getSummary());
    }));
    return router;
  }
}
