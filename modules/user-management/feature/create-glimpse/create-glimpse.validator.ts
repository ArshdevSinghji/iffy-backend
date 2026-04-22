import { z } from "zod";

const mongoIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "must be a valid MongoDB ObjectId");

export const createGlimpseParamsValidator = z.object({
  userID: mongoIdSchema,
});

export const createGlimpseBodyValidator = z.object({
  caption: z.string().max(100).optional(),
});
