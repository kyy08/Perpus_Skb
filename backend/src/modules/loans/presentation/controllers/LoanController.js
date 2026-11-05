import { Router } from 'express';

import { authorize, createAuthenticationMiddleware } from '../../../../middleware/authentication.js';
import { AppError } from '../../../../shared/errors/AppError.js';
import { asyncHandler } from '../../../../shared/http/async-handler.js';
import { getPagination, getPaginationMeta } from '../../../../shared/http/pagination.js';
import { sendSuccess } from '../../../../shared/http/response.js';
import { validate } from '../../../../shared/validation/validate.js';
import {
  loanItemIdSchema,
  loanListSchema,
  rejectRequestSchema,
  requestCreateSchema,
  requestIdSchema,
  requestListSchema,
  returnLoanSchema
} from '../validators/loan.validator.js';

export class LoanController {
  constructor({ loanService, tokenService, userRepository }) {
    this.loanService = loanService;
    this.authentication = createAuthenticationMiddleware({ tokenService, userRepository });
  }

  requestRouter() {
    const router = Router();

    router.use(this.authentication);
    router.post('/', authorize('ANGGOTA'), validate(requestCreateSchema), asyncHandler(async (request, response) => {
      const result = await this.loanService.createRequest({
        memberId: request.user.member.id,
        ...request.body
      });
      sendSuccess(response, result, 201);
    }));

    router.get('/me', authorize('ANGGOTA'), validate(requestListSchema, 'query'), asyncHandler(async (request, response) => {
      const pagination = getPagination(request.query);
      const result = await this.loanService.listRequests({
        ...pagination,
        memberId: request.user.member.id,
        status: request.query.status
      });
      sendSuccess(response, result.items, 200, getPaginationMeta(pagination.page, pagination.limit, result.total));
    }));

    router.get('/', authorize('PETUGAS'), validate(requestListSchema, 'query'), asyncHandler(async (request, response) => {
      const pagination = getPagination(request.query);
      const result = await this.loanService.listRequests({
        ...pagination,
        status: request.query.status
      });
      sendSuccess(response, result.items, 200, getPaginationMeta(pagination.page, pagination.limit, result.total));
    }));

    router.patch('/:id/cancel', authorize('ANGGOTA'), validate(requestIdSchema, 'params'), asyncHandler(async (request, response) => {
      sendSuccess(response, await this.loanService.cancelRequest(request.params.id, request.user.member.id));
    }));

    router.patch('/:id/approve', authorize('PETUGAS'), validate(requestIdSchema, 'params'), asyncHandler(async (request, response) => {
      sendSuccess(response, await this.loanService.approveRequest(request.params.id, request.user.id));
    }));

    router.patch('/:id/reject', authorize('PETUGAS'), validate(requestIdSchema, 'params'), validate(rejectRequestSchema), asyncHandler(async (request, response) => {
      sendSuccess(response, await this.loanService.rejectRequest(request.params.id, request.user.id, request.body.rejectionReason));
    }));

    return router;
  }

  loanRouter() {
    const router = Router();
    router.use(this.authentication);

    router.get('/me', authorize('ANGGOTA'), validate(loanListSchema, 'query'), asyncHandler(async (request, response) => {
      const pagination = getPagination(request.query);
      const result = await this.loanService.listLoans({
        ...pagination,
        memberId: request.user.member.id,
        status: request.query.status
      });
      sendSuccess(response, result.items, 200, getPaginationMeta(pagination.page, pagination.limit, result.total));
    }));

    router.get('/overdue', authorize('PETUGAS'), validate(loanListSchema, 'query'), asyncHandler(async (request, response) => {
      const pagination = getPagination(request.query);
      const result = await this.loanService.listLoans({
        ...pagination,
        memberId: request.query.memberId,
        overdueOnly: true
      });
      sendSuccess(response, result.items, 200, getPaginationMeta(pagination.page, pagination.limit, result.total));
    }));

    router.get('/', authorize('PETUGAS'), validate(loanListSchema, 'query'), asyncHandler(async (request, response) => {
      const pagination = getPagination(request.query);
      const result = await this.loanService.listLoans({
        ...pagination,
        memberId: request.query.memberId,
        status: request.query.status
      });
      sendSuccess(response, result.items, 200, getPaginationMeta(pagination.page, pagination.limit, result.total));
    }));

    router.get('/:id', validate(requestIdSchema, 'params'), asyncHandler(async (request, response) => {
      const loan = await this.loanService.getLoan(request.params.id);
      if (request.user.role === 'ANGGOTA' && loan.memberId !== request.user.member.id) {
        throw new AppError('Peminjaman tidak ditemukan', 404, null, 'LOAN_NOT_FOUND');
      }
      sendSuccess(response, loan);
    }));

    router.patch('/:id/items/:itemId/return', authorize('PETUGAS'), validate(loanItemIdSchema, 'params'), validate(returnLoanSchema), asyncHandler(async (request, response) => {
      const result = await this.loanService.returnItems({
        loanId: request.params.id,
        ...request.body,
        itemIds: [request.params.itemId]
      });
      sendSuccess(response, result);
    }));

    router.patch('/:id/return', authorize('PETUGAS'), validate(requestIdSchema, 'params'), validate(returnLoanSchema), asyncHandler(async (request, response) => {
      sendSuccess(response, await this.loanService.returnItems({ loanId: request.params.id, ...request.body }));
    }));

    return router;
  }
}
