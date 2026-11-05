import { Router } from 'express';

import { authorize, createAuthenticationMiddleware } from '../../../../middleware/authentication.js';
import { asyncHandler } from '../../../../shared/http/async-handler.js';
import { getPagination, getPaginationMeta } from '../../../../shared/http/pagination.js';
import { sendSuccess } from '../../../../shared/http/response.js';
import { validate } from '../../../../shared/validation/validate.js';
import {
  memberIdSchema,
  memberListSchema,
  updateMemberSchema,
  updateMemberStatusSchema
} from '../validators/member.validator.js';

export class MemberController {
  constructor({ memberService, tokenService, userRepository }) {
    this.memberService = memberService;
    this.authentication = createAuthenticationMiddleware({ tokenService, userRepository });
  }

  router() {
    const router = Router();
    const staff = [authorize('PETUGAS')];

    router.use(this.authentication);
    router.get('/me', asyncHandler(async (request, response) => {
      const member = await this.memberService.getByUserId(request.user.id);
      sendSuccess(response, member);
    }));

    router.get('/', ...staff, validate(memberListSchema, 'query'), asyncHandler(async (request, response) => {
      const pagination = getPagination(request.query);
      const result = await this.memberService.list({
        ...pagination,
        search: request.query.search,
        status: request.query.status
      });

      sendSuccess(response, result.items, 200, getPaginationMeta(pagination.page, pagination.limit, result.total));
    }));

    router.get('/:id', ...staff, validate(memberIdSchema, 'params'), asyncHandler(async (request, response) => {
      const member = await this.memberService.getById(request.params.id);
      sendSuccess(response, member);
    }));

    router.patch('/:id', ...staff, validate(memberIdSchema, 'params'), validate(updateMemberSchema), asyncHandler(async (request, response) => {
      const member = await this.memberService.update(request.params.id, request.body);
      sendSuccess(response, member);
    }));

    router.patch('/:id/status', ...staff, validate(memberIdSchema, 'params'), validate(updateMemberStatusSchema), asyncHandler(async (request, response) => {
      const member = await this.memberService.updateStatus(request.params.id, request.body.status);
      sendSuccess(response, member);
    }));

    return router;
  }
}
