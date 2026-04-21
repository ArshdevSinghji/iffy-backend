const catchErrors = require("../../errors/async-catch");
const { roomService } = require("../../service");

exports.getRooms = catchErrors(async (req, res) => {
  const rooms = await roomService.getRooms(req);
  res.status(200).json(rooms);
});
