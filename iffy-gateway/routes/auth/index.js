const { authController } = require("../../controllers");

const router = require("express").Router();

router.post("/", authController.auth);

module.exports = router;
