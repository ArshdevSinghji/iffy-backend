const catchErrors = require("../../errors/async-catch");
const { httpService } = require("../../service");
require("dotenv").config();

exports.likeInteraction = catchErrors(async (req, res) => {
  const from = req.headers["x-user-id"];
  const { to, comment } = req.body;

  const response = await httpService.request(
    {
      method: "post",
      url: `${process.env.USER_SERVICE_URL}/interaction/like`,
      data: { from, to, comment },
    },
    { upstreamName: "USER_SERVICE" },
  );

  res.status(response.status).send(response.data);
});

exports.dislikeInteraction = catchErrors(async (req, res) => {
  const from = req.headers["x-user-id"];
  const { dislikedIds } = req.body;

  const response = await httpService.request(
    {
      method: "post",
      url: `${process.env.USER_SERVICE_URL}/interaction/dislike`,
      data: { from, dislikedIds },
    },
    { upstreamName: "USER_SERVICE" },
  );

  res.status(response.status).send(response.data);
});
