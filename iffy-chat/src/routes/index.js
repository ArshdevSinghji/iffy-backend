const router = require("express").Router();

router.use("/chats", require("./chat"));
router.use("/health", require("./health"));

module.exports = router;
