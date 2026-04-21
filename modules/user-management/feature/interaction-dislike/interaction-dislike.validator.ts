import { z } from "zod";

const mongoIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "must be a valid MongoDB ObjectId");

export const interactionDislikeBodyValidator = z.object({
  from: mongoIdSchema,
  dislikedIds: z
    .array(mongoIdSchema)
    .min(1, "dislikedIds must contain at least one id"),
});
