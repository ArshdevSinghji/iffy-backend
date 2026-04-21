const catchErrors = require("../../errors/async-catch");
const { httpService } = require("../../service");
require("dotenv").config();

exports.editPrompt = catchErrors(async (req, res) => {
  const { promptID } = req.params;
  const userId = req.headers["x-user-id"];
  const body = req.body;
  const response = await httpService.request(
    {
      method: "put",
      url: `${process.env.USER_SERVICE_URL}/users/${userId}/prompts/${promptID}`,
      data: body,
    },
    { upstreamName: "USER_SERVICE" },
  );

  res.status(response.status).send(response.data);
});

exports.deletePrompt = catchErrors(async (req, res) => {
  const { promptID } = req.params;
  const userId = req.headers["x-user-id"];
  const response = await httpService.request(
    {
      method: "delete",
      url: `${process.env.USER_SERVICE_URL}/users/${userId}/prompts/${promptID}`,
    },
    { upstreamName: "USER_SERVICE" },
  );

  res.status(response.status).send(response.data);
});

exports.addPrompts = catchErrors(async (req, res) => {
  const userId = req.headers["x-user-id"];
  const body = req.body;
  const response = await httpService.request(
    {
      method: "put",
      url: `${process.env.USER_SERVICE_URL}/users/${userId}/prompts`,
      data: body,
    },
    { upstreamName: "USER_SERVICE" },
  );

  res.status(response.status).send(response.data);
});
