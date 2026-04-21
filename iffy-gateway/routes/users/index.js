const { userController } = require("../../controllers");
const router = require("express").Router();

router.route("/discovery").get(userController.getDiscovery);
router.route("/likers").get(userController.getLikers);
router
  .route("/profile")
  .get(userController.getProfile)
  .put(userController.updateProfile)
  .delete(userController.deleteProfile);
router
  .route("/glimpses")
  .get(userController.getGlimpses)
  .post(userController.createGlimpse);
router.route("/glimpses/:glimpseId").delete(userController.deleteGlimpse);

module.exports = router;
