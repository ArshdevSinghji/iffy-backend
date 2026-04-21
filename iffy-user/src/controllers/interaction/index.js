const catchErrors = require("../../errors/async-catch");
const { interactionService } = require("../../services");

exports.like = catchErrors(async (req, res) => {
  const { from, to, comment } = req.body;

  await interactionService.likeService({ from, to, comment });
  return res.status(200).json({ message: "Interaction recorded" });
});

exports.dislike = catchErrors(async (req, res) => {
  const { from, dislikedIds } = req.body;

  await interactionService.dislikeService({ from, dislikedIds });
  return res.status(200).json({ message: "Interaction recorded" });
});
