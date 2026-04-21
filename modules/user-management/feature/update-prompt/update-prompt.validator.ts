import { z } from "zod";

const mongoIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "must be a valid MongoDB ObjectId");

export const updatePromptParamsValidator = z.object({
  userID: mongoIdSchema,
  promptID: mongoIdSchema,
});

export const updatePromptBodyValidator = z.object({
  prompts: z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  }),
});
