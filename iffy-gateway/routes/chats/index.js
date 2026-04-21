const { chatController } = require("../../controllers");

const router = require("express").Router();

router.route("/").get(chatController.getRooms);
router.route("/:roomID").get(chatController.getChat);

module.exports = router;