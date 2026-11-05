import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { asyncHandler } from '../../../../shared/http/async-handler.js';
import { sendSuccess } from '../../../../shared/http/response.js';
import { validate } from '../../../../shared/validation/validate.js';
import { createAuthenticationMiddleware } from '../../../../middleware/authentication.js';
import { changePasswordSchema, loginSchema, registerSchema } from '../validators/auth.validator.js';

export class AuthController {
  constructor({ registerMemberService, loginService, getCurrentUserService, changePasswordService, tokenService, userRepository }) {
    this.registerMemberService = registerMemberService;
    this.loginService = loginService;
    this.getCurrentUserService = getCurrentUserService;
    this.changePasswordService = changePasswordService;
    this.authentication = createAuthenticationMiddleware({ tokenService, userRepository });
  }

  router() {
    const router = Router();
    const authenticationLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Terlalu banyak percobaan autentikasi' }
    });

    router.post('/register', authenticationLimiter, validate(registerSchema), asyncHandler(async (request, response) => {
      const user = await this.registerMemberService.execute(request.body);
      sendSuccess(response, user, 201);
    }));

    router.post('/login', authenticationLimiter, validate(loginSchema), asyncHandler(async (request, response) => {
      const result = await this.loginService.execute(request.body);
      sendSuccess(response, result);
    }));

    router.get('/me', this.authentication, asyncHandler(async (request, response) => {
      const user = this.getCurrentUserService.execute(request.user);
      sendSuccess(response, user);
    }));

    router.patch('/password', this.authentication, validate(changePasswordSchema), asyncHandler(async (request, response) => {
      await this.changePasswordService.execute({
        userId: request.user.id,
        ...request.body
      });
      sendSuccess(response, { message: 'Password berhasil diubah' });
    }));

    return router;
  }
}
