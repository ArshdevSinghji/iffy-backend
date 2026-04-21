const { z } = require("zod");

const mongoId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "must be a valid MongoDB ObjectId");

// ── POST /interaction/like ─────────────────────────────────────────────────
const likeSchema = z.object({
  body: z.object({
    from: mongoId,
    to: mongoId,
    comment: z
      .object({
        glimpse: mongoId.optional(),
        prompt: z
          .object({
            question: z.string().optional(),
            answer: z.string().optional(),
          })
          .optional(),
        answer: z.string().optional(),
      })
      .optional(),
  }),
});

// ── POST /interaction/dislike ──────────────────────────────────────────────
const dislikeSchema = z.object({
  body: z.object({
    from: mongoId,
    dislikedIds: z
      .array(mongoId)
      .min(1, "dislikedIds must contain at least one id"),
  }),
});

module.exports = { likeSchema, dislikeSchema };
