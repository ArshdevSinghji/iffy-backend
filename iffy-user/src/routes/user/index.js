const { userController } = require("../../controllers");
const { glimpseController } = require("../../controllers");
const { validate, requireFile } = require("../../middleware/validate");
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
} = require("../../validators/user");

const multer = require("multer");
const { BadRequest } = require("../../errors/custom-errors");

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new BadRequest("Only image files are allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: 120 * 1024 * 1024 }, // 120 MB
});

const router = require("express").Router();

router
  .route("/")
  .get(validate(getFilteredUsersSchema), userController.getFilteredUsers)
  .post(validate(createUserSchema), userController.createUser);
router
  .route("/:userID/likers")
  .get(validate(userIdSchema), userController.getLikers);
router
  .route("/:userID/prompts/:promptID")
  .put(validate(updatePromptSchema), userController.updatePrompt)
  .delete(validate(promptIdsSchema), userController.deletePrompt);
router
  .route("/:userID/prompts")
  .put(validate(addBulkPromptsSchema), userController.addBulkPrompts);
router
  .route("/:userID/glimpses")
  .get(validate(userIdSchema), glimpseController.getGlimpses)
  .post(
    upload.single("image"),
    requireFile,
    validate(createGlimpseSchema),
    glimpseController.createGlimpse,
  );
router
  .route("/:userID/glimpses/:glimpseID")
  .delete(validate(glimpseIdsSchema), glimpseController.deleteGlimpse);
router
  .route("/:userID")
  .get(validate(getUserSchema), userController.getUser)
  .put(validate(updateUserSchema), userController.updateUser)
  .delete(validate(userIdSchema), userController.deleteUser);

module.exports = router;
