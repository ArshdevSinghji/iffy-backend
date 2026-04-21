const router = require("express").Router();

router.get("/", (_req, res) => {
  res.status(200).send({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
