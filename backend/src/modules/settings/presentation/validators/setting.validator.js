import { z } from 'zod';

export const settingUpdateSchema = z.object({
  value: z.union([z.string().min(1), z.number().nonnegative()])
});
