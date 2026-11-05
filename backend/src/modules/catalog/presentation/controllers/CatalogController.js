import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';

import { authorize, createAuthenticationMiddleware } from '../../../../middleware/authentication.js';
import { uploadDirectory } from '../../../../config/uploads.js';
import { AppError } from '../../../../shared/errors/AppError.js';
import { asyncHandler } from '../../../../shared/http/async-handler.js';
import { getPagination, getPaginationMeta } from '../../../../shared/http/pagination.js';
import { sendSuccess } from '../../../../shared/http/response.js';
import { validate } from '../../../../shared/validation/validate.js';
import {
  authorCreateSchema,
  authorUpdateSchema,
  bookCreateSchema,
  bookListSchema,
  bookUpdateSchema,
  catalogIdSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  copyCreateSchema,
  copyUpdateSchema,
  publisherCreateSchema,
  publisherUpdateSchema
} from '../validators/catalog.validator.js';

const coverUpload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (request, file, callback) => {
      const extension = file.mimetype === 'image/png' ? '.png' : file.mimetype === 'image/webp' ? '.webp' : '.jpg';
      callback(null, `cover-${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (request, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      callback(new AppError('Format cover harus JPG, PNG, atau WebP', 422, null, 'INVALID_COVER_TYPE'));
      return;
    }
    callback(null, true);
  }
});

export class CatalogController {
  constructor({ catalogService, tokenService, userRepository }) {
    this.catalogService = catalogService;
    this.authentication = createAuthenticationMiddleware({ tokenService, userRepository });
  }

  router() {
    const router = Router();
    const staff = [this.authentication, authorize('PETUGAS')];

    router.post('/uploads/covers', ...staff, coverUpload.single('file'), asyncHandler(async (request, response) => {
      if (!request.file) {
        throw new AppError('File cover wajib dipilih', 422, null, 'COVER_REQUIRED');
      }

      sendSuccess(response, { url: `${request.protocol}://${request.get('host')}/uploads/${path.basename(request.file.path)}` }, 201);
    }));

    router.get('/books', validate(bookListSchema, 'query'), asyncHandler(async (request, response) => {
      const pagination = getPagination(request.query);
      const result = await this.catalogService.listBooks({
        ...pagination,
        search: request.query.search,
        categoryId: request.query.categoryId,
        availableOnly: request.query.availableOnly
      });
      sendSuccess(response, result.items, 200, getPaginationMeta(pagination.page, pagination.limit, result.total));
    }));

    router.get('/books/:id', validate(catalogIdSchema, 'params'), asyncHandler(async (request, response) => {
      sendSuccess(response, await this.catalogService.getBook(request.params.id));
    }));

    router.post('/books', ...staff, validate(bookCreateSchema), asyncHandler(async (request, response) => {
      sendSuccess(response, await this.catalogService.createBook(request.body), 201);
    }));

    router.patch('/books/:id', ...staff, validate(catalogIdSchema, 'params'), validate(bookUpdateSchema), asyncHandler(async (request, response) => {
      sendSuccess(response, await this.catalogService.updateBook(request.params.id, request.body));
    }));

    router.delete('/books/:id', ...staff, validate(catalogIdSchema, 'params'), asyncHandler(async (request, response) => {
      await this.catalogService.deleteBook(request.params.id);
      sendSuccess(response, { message: 'Buku berhasil dihapus' });
    }));

    router.get('/books/:id/copies', validate(catalogIdSchema, 'params'), asyncHandler(async (request, response) => {
      sendSuccess(response, await this.catalogService.listCopies(request.params.id));
    }));

    router.post('/books/:id/copies', ...staff, validate(catalogIdSchema, 'params'), validate(copyCreateSchema), asyncHandler(async (request, response) => {
      sendSuccess(response, await this.catalogService.createCopy(request.params.id, request.body), 201);
    }));

    router.patch('/book-copies/:id', ...staff, validate(catalogIdSchema, 'params'), validate(copyUpdateSchema), asyncHandler(async (request, response) => {
      sendSuccess(response, await this.catalogService.updateCopy(request.params.id, request.body));
    }));

    this.registerResourceRoutes(router, 'categories', {
      list: () => this.catalogService.listCategories(),
      create: (body) => this.catalogService.createCategory(body),
      update: (id, body) => this.catalogService.updateCategory(id, body),
      remove: (id) => this.catalogService.deleteCategory(id),
      createSchema: categoryCreateSchema,
      updateSchema: categoryUpdateSchema
    }, staff);

    this.registerResourceRoutes(router, 'authors', {
      list: () => this.catalogService.listAuthors(),
      create: (body) => this.catalogService.createAuthor(body),
      update: (id, body) => this.catalogService.updateAuthor(id, body),
      remove: (id) => this.catalogService.deleteAuthor(id),
      createSchema: authorCreateSchema,
      updateSchema: authorUpdateSchema
    }, staff);

    this.registerResourceRoutes(router, 'publishers', {
      list: () => this.catalogService.listPublishers(),
      create: (body) => this.catalogService.createPublisher(body),
      update: (id, body) => this.catalogService.updatePublisher(id, body),
      remove: (id) => this.catalogService.deletePublisher(id),
      createSchema: publisherCreateSchema,
      updateSchema: publisherUpdateSchema
    }, staff);

    return router;
  }

  registerResourceRoutes(router, path, resource, staff) {
    router.get(`/${path}`, asyncHandler(async (request, response) => {
      sendSuccess(response, await resource.list());
    }));
    router.post(`/${path}`, ...staff, validate(resource.createSchema), asyncHandler(async (request, response) => {
      sendSuccess(response, await resource.create(request.body), 201);
    }));
    router.patch(`/${path}/:id`, ...staff, validate(catalogIdSchema, 'params'), validate(resource.updateSchema), asyncHandler(async (request, response) => {
      sendSuccess(response, await resource.update(request.params.id, request.body));
    }));
    router.delete(`/${path}/:id`, ...staff, validate(catalogIdSchema, 'params'), asyncHandler(async (request, response) => {
      await resource.remove(request.params.id);
      sendSuccess(response, { message: `${path} berhasil dihapus` });
    }));
  }
}
