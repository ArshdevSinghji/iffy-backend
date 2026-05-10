import { z } from "zod";

import {
  CoreActivities,
  DatingPreferences,
  Gender,
  Lifestyle,
  MediaConsumption,
  Orientation,
} from "../../domain/models/user/enum";

const mongoIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "must be a valid MongoDB ObjectId");

export const updateUserParamsValidator = z.object({
  userID: mongoIdSchema,
});

export const updateUserBodyValidator = z
  .object({
    name: z.string().min(1).max(100).optional(),
    dob: z.coerce.date().optional(),
    gender: z.nativeEnum(Gender).optional(),
    orientation: z.nativeEnum(Orientation).optional(),
    bio: z.string().max(500).optional(),
    event: z.string().optional(),
    persona: z.string().optional(),
    isActive: z.boolean().optional(),
    place_of_birth: z
      .object({
        latitude: z.number(),
        longitude: z.number(),
      })
      .optional(),
    location: z
      .object({
        type: z.literal("Point"),
        coordinates: z.array(z.number()).length(2),
      })
      .optional(),
    interests: z
      .object({
        coreActivities: z.array(z.nativeEnum(CoreActivities)).optional(),
        mediaConsumption: z.array(z.nativeEnum(MediaConsumption)).optional(),
        lifestyle: z.array(z.nativeEnum(Lifestyle)).optional(),
        datingPreferences: z.array(z.nativeEnum(DatingPreferences)).optional(),
      })
      .optional(),
    prompts: z
      .array(
        z
          .object({
            question: z.string().min(1).max(300),
            answer: z.string().max(1000),
          })
          .strict(),
      )
      .optional(),
  })
  .strip()
  .refine(
    (body) => Object.keys(body).length > 0,
    "Request body must not be empty",
  );
