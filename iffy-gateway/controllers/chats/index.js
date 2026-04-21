const catchErrors = require("../../errors/async-catch");
const { httpService } = require("../../service");
require("dotenv").config();

exports.getRooms = catchErrors(async (req, res) => {
  const userId = req.headers["x-user-id"];
  const response = await httpService.request(
    {
      method: "get",
      url: `${process.env.CHAT_SERVICE_URL}/chats`,
      params: { userID: userId },
    },
    { upstreamName: "CHAT_SERVICE" },
  );

  res.status(response.status).send(response.data);
});

exports.getChat = catchErrors(async (req, res) => {
  const userId = req.headers["x-user-id"];
  const { roomID } = req.params;
  const { limit, page } = req.query;

  const response = await httpService.request(
    {
      method: "get",
      url: `${process.env.CHAT_SERVICE_URL}/chats/${roomID}`,
      params: { userID: userId, limit, page },
    },
    { upstreamName: "CHAT_SERVICE" },
  );

  res.status(response.status).send(response.data);
});
