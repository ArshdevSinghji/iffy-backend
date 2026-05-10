import { z } from "zod";

export const createUserValidator = z.object({
  uid: z.string().min(1, "uid is required"),
  email: z.string().email("must be a valid email"),
});

export type CreateUserDTO = z.infer<typeof createUserValidator>;
