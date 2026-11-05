import { z } from 'zod';

export const memberIdSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const memberListSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().max(100).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).optional()
});

export const updateMemberSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().max(150).optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  address: z.string().trim().max(1000).nullable().optional(),
  birthDate: z.coerce.date().nullable().optional()
}).refine((value) => Object.keys(value).length > 0, { message: 'Minimal satu data harus diubah.' });

export const updateMemberStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED'])
});
