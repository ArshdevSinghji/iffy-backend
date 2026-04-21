const assert = require("assert");
const express = require("express");
const request = require("supertest");

const controllers = require("./src/controllers");
controllers.roomController.getRooms = (_req, res) => {
  res.status(200).json({ ok: true, route: "getRooms" });
};
controllers.chatController.getChats = (_req, res) => {
  res.status(200).json({ ok: true, route: "getChats" });
};

const routes = require("./src/routes");
const { handleError } = require("./src/middleware/handle-error");

const app = express();
app.use(express.json());
app.use("/", routes);
app.use(handleError);

const validId = "507f1f77bcf86cd799439011";

const tests = [
  {
    name: "GET /chats valid query returns 200",
    run: async () => {
      await request(app).get(`/chats?userID=${validId}`).expect(200);
    },
  },
  {
    name: "GET /chats missing userID returns 400",
    run: async () => {
      const response = await request(app).get("/chats").expect(400);
      assert.strictEqual(response.body.error.code, "BAD_REQUEST");
    },
  },
  {
    name: "GET /chats invalid userID returns 400",
    run: async () => {
      const response = await request(app)
        .get("/chats?userID=invalid")
        .expect(400);
      assert.strictEqual(response.body.error.code, "BAD_REQUEST");
    },
  },
  {
    name: "GET /chats/:roomId valid params and query returns 200",
    run: async () => {
      await request(app).get(`/chats/${validId}?limit=10&page=1`).expect(200);
    },
  },
  {
    name: "GET /chats/:roomId invalid roomId returns 400",
    run: async () => {
      const response = await request(app).get("/chats/invalid").expect(400);
      assert.strictEqual(response.body.error.code, "BAD_REQUEST");
    },
  },
  {
    name: "GET /chats/:roomId invalid page returns 400",
    run: async () => {
      const response = await request(app)
        .get(`/chats/${validId}?page=0`)
        .expect(400);
      assert.strictEqual(response.body.error.code, "BAD_REQUEST");
    },
  },
];

(async () => {
  let passed = 0;

  for (const test of tests) {
    try {
      await test.run();
      passed += 1;
      console.log(`✓ ${test.name}`);
    } catch (error) {
      console.error(`✗ ${test.name}`);
      console.error(error);
      process.exit(1);
    }
  }

  console.log(`\n${passed}/${tests.length} validation tests passed.`);
})();
