const catchErrors = require("../../errors/async-catch");
const { chatService } = require("../../service");

exports.getChats = catchErrors(async (req, res) => {
  const chats = await chatService.getChats(req);
  res.status(200).json(chats);
});
