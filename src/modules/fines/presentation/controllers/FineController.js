import { Router } from 'express';

import { authorize, createAuthenticationMiddleware } from '../../../../middleware/authentication.js';
import { asyncHandler } from '../../../../shared/http/async-handler.js';
import { getPagination, getPaginationMeta } from '../../../../shared/http/pagination.js';
import { sendSuccess } from '../../../../shared/http/response.js';
import { validate } from '../../../../shared/validation/validate.js';
import { fineIdSchema, fineListSchema, waiveFineSchema } from '../validators/fine.validator.js';

export class FineController {
  constructor({ fineService, tokenService, userRepository }) {
    this.fineService = fineService;
    this.authentication = createAuthenticationMiddleware({ tokenService, userRepository });
  }

  router() {
    const router = Router();
    router.use(this.authentication);

    router.get('/me', authorize('ANGGOTA'), validate(fineListSchema, 'query'), asyncHandler(async (request, response) => {
      const pagination = getPagination(request.query);
      const result = await this.fineService.list({
        ...pagination,
        memberId: request.user.member.id,
        status: request.query.status
      });
      sendSuccess(response, result.items, 200, getPaginationMeta(pagination.page, pagination.limit, result.total));
    }));

    router.get('/', authorize('PETUGAS'), validate(fineListSchema, 'query'), asyncHandler(async (request, response) => {
      const pagination = getPagination(request.query);
      const result = await this.fineService.list({ ...pagination, status: request.query.status, memberId: request.query.memberId });
      sendSuccess(response, result.items, 200, getPaginationMeta(pagination.page, pagination.limit, result.total));
    }));

    router.patch('/:id/pay', authorize('PETUGAS'), validate(fineIdSchema, 'params'), asyncHandler(async (request, response) => {
      sendSuccess(response, await this.fineService.pay(request.params.id, request.user.id));
    }));

    router.patch('/:id/waive', authorize('PETUGAS'), validate(fineIdSchema, 'params'), validate(waiveFineSchema), asyncHandler(async (request, response) => {
      sendSuccess(response, await this.fineService.waive(request.params.id, request.user.id, request.body.notes));
    }));

    return router;
  }
}
