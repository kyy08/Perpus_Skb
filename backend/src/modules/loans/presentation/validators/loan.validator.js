import { z } from 'zod';

export const requestIdSchema = z.object({ id: z.coerce.number().int().positive() });
export const loanItemIdSchema = z.object({
  id: z.coerce.number().int().positive(),
  itemId: z.coerce.number().int().positive()
});

export const requestCreateSchema = z.object({
  bookIds: z.array(z.coerce.number().int().positive()).min(1).max(2),
  requestedDurationDays: z.coerce.number().int().positive().max(365),
  notes: z.string().trim().max(1000).nullable().optional()
}).superRefine((value, context) => {
  if (new Set(value.bookIds).size !== value.bookIds.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['bookIds'], message: 'Buku tidak boleh duplikat' });
  }
});

export const requestListSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional()
});

export const rejectRequestSchema = z.object({
  rejectionReason: z.string().trim().min(3).max(1000)
});

export const loanListSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(['BORROWED', 'PARTIALLY_RETURNED', 'RETURNED', 'CANCELLED']).optional(),
  overdueOnly: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  memberId: z.coerce.number().int().positive().optional()
});

export const returnLoanSchema = z.object({
  itemIds: z.array(z.coerce.number().int().positive()).min(1).optional(),
  returnStatus: z.enum(['ON_TIME', 'LATE']).optional(),
  lateDays: z.coerce.number().int().min(1).max(365).optional(),
  notes: z.string().trim().max(1000).nullable().optional()
});
