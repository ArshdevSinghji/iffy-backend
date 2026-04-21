const router = require("express").Router();

router.use("/health", require("./health"));
router.use("/users", require("./user"));
router.use("/interaction", require("./interaction"));
module.exports = router;
