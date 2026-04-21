const { verifyToken } = require("../middleware/authorization");

const router = require("express").Router();

router.use("/auth", require("./auth"));
router.use("/health", require("./health"));
router.use("/users", verifyToken, require("./users"));
router.use("/interactions", verifyToken, require("./interactions"));
router.use("/chats", verifyToken, require("./chats"));
router.use("/prompts", verifyToken, require("./prompts"));

module.exports = router;
