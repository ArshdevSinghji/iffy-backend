const { roomController, chatController } = require("../../controllers");
const { validate } = require("../../validators");
const { getRoomsSchema, getChatsSchema } = require("../../validators/chat");

const router = require("express").Router();

router.route("/").get(validate(getRoomsSchema), roomController.getRooms);
router.route("/:roomId").get(validate(getChatsSchema), chatController.getChats);

module.exports = router;
