/**
 * Validation smoke tests
 * Spins up a stripped Express app (no DB) and runs every validator.
 */

"use strict";

const express = require("express");
const supertest = require("supertest");
const { validate, requireFile } = require("../middleware/validate");
const { handleError } = require("../middleware/handle-error");
const {
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
} = require("../validators/user");
const { likeSchema, dislikeSchema } = require("../validators/interaction");

// ── helpers ────────────────────────────────────────────────────────────────
const ok = (_req, res) => res.status(200).json({ ok: true });
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

function buildApp() {
  const app = express();
  app.use(express.json());

  const r = express.Router();

  r.post("/users", validate(createUserSchema), ok);
  r.get("/users", validate(getFilteredUsersSchema), ok);
  r.get("/users/:userID", validate(getUserSchema), ok);
  r.put("/users/:userID", validate(updateUserSchema), ok);
  r.delete("/users/:userID", validate(userIdSchema), ok);
  r.put("/users/:userID/prompts", validate(addBulkPromptsSchema), ok);
  r.put("/users/:userID/prompts/:promptID", validate(updatePromptSchema), ok);
  r.delete("/users/:userID/prompts/:promptID", validate(promptIdsSchema), ok);
  r.post(
    "/users/:userID/glimpses",
    upload.single("image"),
    requireFile,
    validate(createGlimpseSchema),
    ok,
  );
  r.delete(
    "/users/:userID/glimpses/:glimpseID",
    validate(glimpseIdsSchema),
    ok,
  );
  r.post("/interaction/like", validate(likeSchema), ok);
  r.post("/interaction/dislike", validate(dislikeSchema), ok);

  app.use(r);
  app.use(handleError);
  return app;
}

// ── constants ──────────────────────────────────────────────────────────────
const VALID_ID = "69b3ba591f9585f2226b36d6";
const BAD_ID = "notAnObjectId";

// ── test runner ────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

async function test(label, fn) {
  try {
    await fn();
    console.log(`  ✓  ${label}`);
    passed++;
  } catch (err) {
    console.error(`  ✗  ${label}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

function expect(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`expected ${label} ${expected}, got ${actual}`);
  }
}

// ── tests ──────────────────────────────────────────────────────────────────
(async () => {
  const req = supertest(buildApp());

  // ── POST /users ──────────────────────────────────────────────────────────
  console.log("\nPOST /users");
  await test("valid uid", async () => {
    const r = await req.post("/users").send({ uid: "firebase-abc-123" });
    expect(r.status, 200, "status");
  });
  await test("missing uid => 400", async () => {
    const r = await req.post("/users").send({});
    expect(r.status, 400, "status");
  });
  await test("empty uid => 400", async () => {
    const r = await req.post("/users").send({ uid: "" });
    expect(r.status, 400, "status");
  });

  // ── GET /users ───────────────────────────────────────────────────────────
  console.log("\nGET /users");
  await test("valid query", async () => {
    const r = await req.get(`/users?userID=${VALID_ID}`);
    expect(r.status, 200, "status");
  });
  await test("bad userID => 400", async () => {
    const r = await req.get(`/users?userID=${BAD_ID}`);
    expect(r.status, 400, "status");
  });
  await test("missing userID => 400", async () => {
    const r = await req.get("/users");
    expect(r.status, 400, "status");
  });
  await test("invalid limit => 400", async () => {
    const r = await req.get(`/users?userID=${VALID_ID}&limit=-5`);
    expect(r.status, 400, "status");
  });

  // ── GET /users/:userID ───────────────────────────────────────────────────
  console.log("\nGET /users/:userID");
  await test("valid id", async () => {
    const r = await req.get(`/users/${VALID_ID}`);
    expect(r.status, 200, "status");
  });
  await test("bad id => 400", async () => {
    const r = await req.get(`/users/${BAD_ID}`);
    expect(r.status, 400, "status");
  });

  // ── PUT /users/:userID ───────────────────────────────────────────────────
  console.log("\nPUT /users/:userID");
  await test("valid partial update", async () => {
    const r = await req
      .put(`/users/${VALID_ID}`)
      .send({ name: "Alice", gender: "female" });
    expect(r.status, 200, "status");
  });
  await test("bad id => 400", async () => {
    const r = await req.put(`/users/${BAD_ID}`).send({ name: "x" });
    expect(r.status, 400, "status");
  });
  await test("empty body => 400", async () => {
    const r = await req.put(`/users/${VALID_ID}`).send({});
    expect(r.status, 400, "status");
  });
  await test("invalid gender enum => 400", async () => {
    const r = await req
      .put(`/users/${VALID_ID}`)
      .send({ gender: "attack helicopter" });
    expect(r.status, 400, "status");
  });
  await test("bio too long => 400", async () => {
    const r = await req
      .put(`/users/${VALID_ID}`)
      .send({ bio: "x".repeat(501) });
    expect(r.status, 400, "status");
  });

  // ── DELETE /users/:userID ────────────────────────────────────────────────
  console.log("\nDELETE /users/:userID");
  await test("valid id", async () => {
    const r = await req.delete(`/users/${VALID_ID}`);
    expect(r.status, 200, "status");
  });
  await test("bad id => 400", async () => {
    const r = await req.delete(`/users/${BAD_ID}`);
    expect(r.status, 400, "status");
  });

  // ── PUT /users/:userID/prompts ───────────────────────────────────────────
  console.log("\nPUT /users/:userID/prompts");
  await test("valid prompts array", async () => {
    const r = await req
      .put(`/users/${VALID_ID}/prompts`)
      .send({ prompts: [{ question: "Q1", answer: "A1" }] });
    expect(r.status, 200, "status");
  });
  await test("empty array => 400", async () => {
    const r = await req.put(`/users/${VALID_ID}/prompts`).send({ prompts: [] });
    expect(r.status, 400, "status");
  });
  await test("missing answer => 400", async () => {
    const r = await req
      .put(`/users/${VALID_ID}/prompts`)
      .send({ prompts: [{ question: "Q1" }] });
    expect(r.status, 400, "status");
  });

  // ── PUT /users/:userID/prompts/:promptID ─────────────────────────────────
  console.log("\nPUT /users/:userID/prompts/:promptID");
  await test("valid prompt update", async () => {
    const r = await req
      .put(`/users/${VALID_ID}/prompts/${VALID_ID}`)
      .send({ prompts: { question: "Q", answer: "A" } });
    expect(r.status, 200, "status");
  });
  await test("bad promptID => 400", async () => {
    const r = await req
      .put(`/users/${VALID_ID}/prompts/${BAD_ID}`)
      .send({ prompts: { question: "Q", answer: "A" } });
    expect(r.status, 400, "status");
  });

  // ── POST /users/:userID/glimpses ─────────────────────────────────────────
  console.log("\nPOST /users/:userID/glimpses");
  await test("valid upload with caption", async () => {
    const r = await req
      .post(`/users/${VALID_ID}/glimpses`)
      .field("caption", "my caption")
      .attach("image", Buffer.from("fake-img"), {
        filename: "test.jpg",
        contentType: "image/jpeg",
      });
    expect(r.status, 200, "status");
  });
  await test("valid upload without caption", async () => {
    const r = await req
      .post(`/users/${VALID_ID}/glimpses`)
      .attach("image", Buffer.from("fake-img"), {
        filename: "test.jpg",
        contentType: "image/jpeg",
      });
    expect(r.status, 200, "status");
  });
  await test("missing file => 400", async () => {
    const r = await req.post(`/users/${VALID_ID}/glimpses`).send({});
    expect(r.status, 400, "status");
  });
  await test("caption too long => 400", async () => {
    const r = await req
      .post(`/users/${VALID_ID}/glimpses`)
      .field("caption", "x".repeat(101))
      .attach("image", Buffer.from("fake-img"), {
        filename: "test.jpg",
        contentType: "image/jpeg",
      });
    expect(r.status, 400, "status");
  });
  await test("bad userID => 400", async () => {
    const r = await req
      .post(`/users/${BAD_ID}/glimpses`)
      .attach("image", Buffer.from("fake-img"), {
        filename: "test.jpg",
        contentType: "image/jpeg",
      });
    expect(r.status, 400, "status");
  });

  // ── DELETE /users/:userID/glimpses/:glimpseID ────────────────────────────
  console.log("\nDELETE /users/:userID/glimpses/:glimpseID");
  await test("valid ids", async () => {
    const r = await req.delete(`/users/${VALID_ID}/glimpses/${VALID_ID}`);
    expect(r.status, 200, "status");
  });
  await test("bad glimpseID => 400", async () => {
    const r = await req.delete(`/users/${VALID_ID}/glimpses/${BAD_ID}`);
    expect(r.status, 400, "status");
  });

  // ── POST /interaction/like ───────────────────────────────────────────────
  console.log("\nPOST /interaction/like");
  await test("valid like (no comment)", async () => {
    const r = await req
      .post("/interaction/like")
      .send({ from: VALID_ID, to: VALID_ID });
    expect(r.status, 200, "status");
  });
  await test("valid like with glimpse comment", async () => {
    const r = await req
      .post("/interaction/like")
      .send({ from: VALID_ID, to: VALID_ID, comment: { glimpse: VALID_ID } });
    expect(r.status, 200, "status");
  });
  await test("missing to => 400", async () => {
    const r = await req.post("/interaction/like").send({ from: VALID_ID });
    expect(r.status, 400, "status");
  });
  await test("bad from id => 400", async () => {
    const r = await req
      .post("/interaction/like")
      .send({ from: BAD_ID, to: VALID_ID });
    expect(r.status, 400, "status");
  });

  // ── POST /interaction/dislike ────────────────────────────────────────────
  console.log("\nPOST /interaction/dislike");
  await test("valid dislike", async () => {
    const r = await req
      .post("/interaction/dislike")
      .send({ from: VALID_ID, dislikedIds: [VALID_ID] });
    expect(r.status, 200, "status");
  });
  await test("empty dislikedIds => 400", async () => {
    const r = await req
      .post("/interaction/dislike")
      .send({ from: VALID_ID, dislikedIds: [] });
    expect(r.status, 400, "status");
  });
  await test("bad id in dislikedIds => 400", async () => {
    const r = await req
      .post("/interaction/dislike")
      .send({ from: VALID_ID, dislikedIds: [BAD_ID] });
    expect(r.status, 400, "status");
  });
  await test("missing from => 400", async () => {
    const r = await req
      .post("/interaction/dislike")
      .send({ dislikedIds: [VALID_ID] });
    expect(r.status, 400, "status");
  });

  // ── result ───────────────────────────────────────────────────────────────
  console.log(`\n${"─".repeat(44)}`);
  console.log(`  ${passed} passed   ${failed} failed`);
  console.log(`${"─".repeat(44)}\n`);
  if (failed > 0) process.exit(1);
})();
