import { Router } from 'express';

import { authorize, createAuthenticationMiddleware } from '../../../../middleware/authentication.js';
import { asyncHandler } from '../../../../shared/http/async-handler.js';
import { sendSuccess } from '../../../../shared/http/response.js';
import { validate } from '../../../../shared/validation/validate.js';
import { settingUpdateSchema } from '../validators/setting.validator.js';

export class SettingController {
  constructor({ settingService, tokenService, userRepository }) {
    this.settingService = settingService;
    this.authentication = createAuthenticationMiddleware({ tokenService, userRepository });
  }

  router() {
    const router = Router();
    router.use(this.authentication, authorize('PETUGAS'));

    router.get('/', asyncHandler(async (request, response) => {
      sendSuccess(response, await this.settingService.list());
    }));

    router.patch('/:key', validate(settingUpdateSchema), asyncHandler(async (request, response) => {
      const setting = await this.settingService.update(request.params.key, request.body.value, request.user.id);
      sendSuccess(response, setting);
    }));

    return router;
  }
}
