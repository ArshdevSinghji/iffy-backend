const { z } = require("zod");

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "must be a valid MongoDB ObjectId");

const getRoomsSchema = z.object({
  params: z.object({}),
  query: z.object({
    userID: objectIdSchema,
  }),
  body: z.object({}),
});

const getChatsSchema = z.object({
  params: z.object({
    roomId: objectIdSchema,
  }),
  query: z.object({
    limit: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().optional(),
  }),
  body: z.object({}),
});

module.exports = {
  getRoomsSchema,
  getChatsSchema,
};
