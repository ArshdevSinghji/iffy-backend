const { promptController } = require("../../controllers");

const router = require("express").Router();

router
  .route("/:promptID")
  .put(promptController.editPrompt)
  .delete(promptController.deletePrompt);

router.route("/").put(promptController.addPrompts);

module.exports = router;
