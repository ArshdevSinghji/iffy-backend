const catchErrors = require("../../errors/async-catch");
const { glimpseService } = require("../../services");

exports.getGlimpses = catchErrors(async (req, res) => {
  const response = await glimpseService.getGlimpsesService(req);
  res.status(200).json(response);
});

exports.createGlimpse = catchErrors(async (req, res) => {
  await glimpseService.createGlimpseService(req);
  res.status(201).json({ message: "Glimpse created successfully" });
});

exports.deleteGlimpse = catchErrors(async (req, res) => {
  const result = await glimpseService.deleteGlimpseService(req);
  res.status(200).json({ message: "Glimpse deleted successfully", result });
});
