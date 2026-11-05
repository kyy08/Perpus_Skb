import { z } from 'zod';

export const fineIdSchema = z.object({ id: z.coerce.number().int().positive() });

export const fineListSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(['UNPAID', 'PAID', 'WAIVED']).optional(),
  memberId: z.coerce.number().int().positive().optional()
});

export const waiveFineSchema = z.object({
  notes: z.string().trim().max(1000).nullable().optional()
});
