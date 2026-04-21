const { interactionController } = require("../../controllers");
const { validate } = require("../../middleware/validate");
const { likeSchema, dislikeSchema } = require("../../validators/interaction");

const router = require("express").Router();

router.route("/like").post(validate(likeSchema), interactionController.like);
router
  .route("/dislike")
  .post(validate(dislikeSchema), interactionController.dislike);

module.exports = router;
