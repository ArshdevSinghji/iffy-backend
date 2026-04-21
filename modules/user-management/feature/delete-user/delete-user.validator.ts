import { z } from "zod";

const mongoIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "must be a valid MongoDB ObjectId");

export const deleteUserParamsValidator = z.object({
  userID: mongoIdSchema,
});
