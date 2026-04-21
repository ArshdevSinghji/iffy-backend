import { z } from "zod";

const mongoIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "must be a valid MongoDB ObjectId");

const parseAgeRange = (value: unknown): number[] | undefined => {
  if (Array.isArray(value)) {
    return value.map((item) => Number(item));
  }

  if (typeof value === "string") {
    const values = value
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((item) => !Number.isNaN(item));

    return values.length ? values : undefined;
  }

  return undefined;
};

export const listUsersQueryValidator = z.object({
  userID: mongoIdSchema,
  age_range: z
    .preprocess(
      parseAgeRange,
      z.array(z.number().int().min(0).max(100)).length(2),
    )
    .optional(),
  distance: z.coerce.number().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  page: z.coerce.number().int().positive().optional(),
});
