import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "must be a valid MongoDB ObjectId");

export const getRoomsSchema = z.object({
  params: z.object({}),
  query: z.object({
    userID: objectIdSchema,
  }),
});
