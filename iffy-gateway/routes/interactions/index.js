const { interactionController } = require("../../controllers");

const router = require("express").Router();

router.route("/like").post(interactionController.likeInteraction);
router.route("/dislike").post(interactionController.dislikeInteraction);

module.exports = router;
