const catchErrors = require("../../errors/async-catch");
const { userService } = require("../../services");

exports.getUser = catchErrors(async (req, res) => {
  const user = await userService.getUser(req);
  res.status(200).send(user);
});

exports.getFilteredUsers = catchErrors(async (req, res) => {
  const users = await userService.getFilteredUsers(req.query);
  res.status(200).send(users);
});

exports.createUser = catchErrors(async (req, res) => {
  const { uid } = req.body;
  const response = await userService.handleUserAuth(uid);
  res.status(201).send(response);
});

exports.updateUser = catchErrors(async (req, res) => {
  const { userID } = req.params;
  const { body } = req;
  const result = await userService.updateUserDetails(userID, body);
  res.status(201).send({ message: "User updated successfully", result });
});

exports.deleteUser = catchErrors(async (req, res) => {
  const { userID } = req.params;
  const result = await userService.deleteUser(userID);
  res.status(201).send({ message: "User deleted successfully", result });
});

exports.updatePrompt = catchErrors(async (req, res) => {
  const { userID, promptID } = req.params;
  const { prompts } = req.body;
  const result = await userService.updatePrompt(userID, promptID, prompts);
  res.status(201).send({ message: "Prompt updated successfully", result });
});

exports.deletePrompt = catchErrors(async (req, res) => {
  const { userID, promptID } = req.params;
  const result = await userService.deletePrompt(userID, promptID);
  res.status(201).send({ message: "Prompt deleted successfully", result });
});

exports.addBulkPrompts = catchErrors(async (req, res) => {
  const { userID } = req.params;
  const { prompts } = req.body;
  const result = await userService.addBulkPrompts(userID, prompts);
  res.status(201).send({ message: "Bulk prompts added successfully", result });
});

exports.getLikers = catchErrors(async (req, res) => {
  const { userID } = req.params;
  const likers = await userService.getLikers(userID);
  res.status(200).send(likers);
});
