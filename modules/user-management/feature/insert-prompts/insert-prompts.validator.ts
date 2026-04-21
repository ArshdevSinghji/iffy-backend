import { z } from "zod";

const mongoIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "must be a valid MongoDB ObjectId");

export const insertPromptsParamsValidator = z.object({
  userID: mongoIdSchema,
});

export const insertPromptsBodyValidator = z.object({
  prompts: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      }),
    )
    .min(1, "prompts must contain at least one item"),
});
