import { Router } from 'express';

import { authorize, createAuthenticationMiddleware } from '../../../../middleware/authentication.js';
import { asyncHandler } from '../../../../shared/http/async-handler.js';
import { sendSuccess } from '../../../../shared/http/response.js';
import { validate } from '../../../../shared/validation/validate.js';
import { reportQuerySchema } from '../validators/report.validator.js';

export class ReportController {
  constructor({ reportService, tokenService, userRepository }) {
    this.reportService = reportService;
    this.authentication = createAuthenticationMiddleware({ tokenService, userRepository });
  }

  router() {
    const router = Router();
    router.use(this.authentication, authorize('PETUGAS'));

    router.get('/loans/export.xlsx', validate(reportQuerySchema, 'query'), asyncHandler(async (request, response) => {
      const buffer = await this.reportService.exportLoans(request.query);
      response
        .status(200)
        .set({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="laporan-peminjaman.xlsx"'
        })
        .send(buffer);
    }));

    router.get('/loans', validate(reportQuerySchema, 'query'), asyncHandler(async (request, response) => {
      sendSuccess(response, await this.reportService.listLoans(request.query));
    }));

    router.get('/fines/export.xlsx', validate(reportQuerySchema, 'query'), asyncHandler(async (request, response) => {
      const buffer = await this.reportService.exportFines(request.query);
      response
        .status(200)
        .set({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="laporan-denda.xlsx"'
        })
        .send(buffer);
    }));

    router.get('/fines', validate(reportQuerySchema, 'query'), asyncHandler(async (request, response) => {
      sendSuccess(response, await this.reportService.listFines(request.query));
    }));

    return router;
  }
}
