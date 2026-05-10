import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "must be a valid MongoDB ObjectId");

export const getChatsSchema = z.object({
  params: z.object({
    roomId: objectIdSchema,
  }),
  query: z.object({
    limit: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().optional(),
  }),
});
