import { z } from "zod";

const mongoIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "must be a valid MongoDB ObjectId");

export const interactionLikeBodyValidator = z.object({
  from: mongoIdSchema,
  to: mongoIdSchema,
  comment: z
    .object({
      glimpse: mongoIdSchema.optional(),
      prompt: z
        .object({
          question: z.string().optional(),
          answer: z.string().optional(),
        })
        .optional(),
      answer: z.string().optional(),
    })
    .optional(),
});
