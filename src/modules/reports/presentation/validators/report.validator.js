import { z } from 'zod';

export const reportQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z.string().optional()
}).refine(({ startDate, endDate }) => !startDate || !endDate || startDate <= endDate, {
  path: ['endDate'],
  message: 'Tanggal akhir tidak boleh sebelum tanggal mulai.'
});
