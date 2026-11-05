import { z } from 'zod';

const idSchema = z.object({ id: z.coerce.number().int().positive() });
const nameSchema = z.object({ name: z.string().trim().min(2).max(150) });
const booleanQuery = z.enum(['true', 'false']).transform((value) => value === 'true');

export const catalogIdSchema = idSchema;

export const bookListSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().max(150).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  availableOnly: booleanQuery.optional()
});

const bookFieldsSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).nullable().optional(),
  publicationYear: z.coerce.number().int().min(1000).max(2200).nullable().optional(),
  language: z.string().trim().min(1).max(50).optional(),
  publisherId: z.coerce.number().int().positive().nullable().optional(),
  categoryId: z.coerce.number().int().positive().nullable().optional(),
  coverUrl: z.string().url().max(500).nullable().optional(),
  authorIds: z.array(z.coerce.number().int().positive()).max(20).optional()
});

export const bookCreateSchema = bookFieldsSchema.extend({
  copyCount: z.coerce.number().int().min(1).max(100).default(1)
});

export const bookUpdateSchema = bookFieldsSchema.partial().refine((value) => Object.keys(value).length > 0, { message: 'Minimal satu data harus diubah.' });

export const copyCreateSchema = z.object({
  inventoryCode: z.string().trim().min(1).max(50),
  acquisitionDate: z.coerce.date().nullable().optional(),
  acquisitionPrice: z.coerce.number().nonnegative().nullable().optional(),
  conditionStatus: z.enum(['GOOD', 'DAMAGED', 'LOST']).optional(),
  availabilityStatus: z.enum(['AVAILABLE', 'BORROWED', 'MAINTENANCE', 'LOST']).optional(),
  notes: z.string().trim().max(1000).nullable().optional()
});

export const copyUpdateSchema = copyCreateSchema.partial().refine((value) => Object.keys(value).length > 0, { message: 'Minimal satu data harus diubah.' });
export const categoryCreateSchema = z.object({ name: z.string().trim().min(2).max(100), slug: z.string().trim().min(2).max(120).optional() });
export const authorCreateSchema = nameSchema;
export const publisherCreateSchema = z.object({
  name: z.string().trim().min(2).max(150),
  address: z.string().trim().max(1000).nullable().optional(),
  phone: z.string().trim().max(20).nullable().optional()
});
export const categoryUpdateSchema = categoryCreateSchema.partial().refine((value) => Object.keys(value).length > 0, { message: 'Minimal satu data harus diubah.' });
export const authorUpdateSchema = authorCreateSchema.partial().refine((value) => Object.keys(value).length > 0, { message: 'Minimal satu data harus diubah.' });
export const publisherUpdateSchema = publisherCreateSchema.partial().refine((value) => Object.keys(value).length > 0, { message: 'Minimal satu data harus diubah.' });
