const { z } = require("zod");
const {
  Gender,
  Orientation,
  CoreActivities,
  MediaConsumption,
  Lifestyle,
  DatingPreferences,
} = require("../models/user/enum");

const mongoId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "must be a valid MongoDB ObjectId");

// ── reusable param blocks ──────────────────────────────────────────────────
const userIdParams = z.object({ userID: mongoId });
const promptIdParams = z.object({ userID: mongoId, promptID: mongoId });
const glimpseIdParams = z.object({ userID: mongoId, glimpseID: mongoId });

// ── POST /users ────────────────────────────────────────────────────────────
const createUserSchema = z.object({
  body: z.object({
    uid: z.string().min(1, "uid is required"),
  }),
});

// ── GET /users ─────────────────────────────────────────────────────────────
const getFilteredUsersSchema = z.object({
  query: z.object({
    userID: mongoId,
    age_range: z
      .preprocess(
        (v) => (Array.isArray(v) ? v.map(Number) : undefined),
        z.array(z.number().int().min(0).max(100)).length(2),
      )
      .optional(),
    distance: z.coerce.number().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    page: z.coerce.number().int().positive().optional(),
  }),
});

// ── GET /:userID ───────────────────────────────────────────────────────────
const getUserSchema = z.object({
  params: userIdParams,
  query: z.object({
    fields: z.string().optional(),
  }),
});

// ── PUT /:userID ───────────────────────────────────────────────────────────
const updateUserSchema = z.object({
  params: userIdParams,
  body: z
    .object({
      name: z.string().min(1).max(100).optional(),
      dob: z.coerce.date().optional(),
      gender: z.nativeEnum(Gender).optional(),
      orientation: z.nativeEnum(Orientation).optional(),
      bio: z.string().max(500).optional(),
      event: z.string().optional(),
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
          datingPreferences: z
            .array(z.nativeEnum(DatingPreferences))
            .optional(),
        })
        .optional(),
    })
    .strip()
    .refine((b) => Object.keys(b).length > 0, "Request body must not be empty"),
});

// ── PUT /:userID/prompts ───────────────────────────────────────────────────
const addBulkPromptsSchema = z.object({
  params: userIdParams,
  body: z.object({
    prompts: z
      .array(
        z.object({
          question: z.string().min(1),
          answer: z.string().min(1),
        }),
      )
      .min(1, "prompts must contain at least one item"),
  }),
});

// ── PUT /:userID/prompts/:promptID ─────────────────────────────────────────
const updatePromptSchema = z.object({
  params: promptIdParams,
  body: z.object({
    prompts: z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
    }),
  }),
});

// ── POST /:userID/glimpses ─────────────────────────────────────────────────
const createGlimpseSchema = z.object({
  params: userIdParams,
  body: z.object({
    caption: z.string().max(100).optional(),
  }),
});

// ── simple param-only schemas ──────────────────────────────────────────────
const userIdSchema = z.object({ params: userIdParams });
const promptIdsSchema = z.object({ params: promptIdParams });
const glimpseIdsSchema = z.object({ params: glimpseIdParams });

module.exports = {
  createUserSchema,
  getFilteredUsersSchema,
  getUserSchema,
  updateUserSchema,
  addBulkPromptsSchema,
  updatePromptSchema,
  createGlimpseSchema,
  userIdSchema,
  promptIdsSchema,
  glimpseIdsSchema,
};
