import { z } from "zod";

export const createUserValidator = z.object({
  uid: z.string().min(1, "uid is required"),
});

export type CreateUserDTO = z.infer<typeof createUserValidator>;
