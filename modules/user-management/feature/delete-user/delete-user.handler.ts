import { Request, Response } from "express";

import { NotFoundError } from "../../../../shared/errors";
import { catchErrors } from "../../../../shared/middleware";
import { UserRepository } from "../../infrastructure/repository/user.repository";
import { publishEvent } from "../../infrastructure/message-bus/message-bus.publisher";
import { deleteUserParamsValidator } from "./delete-user.validator";

export const deleteUserHandler = catchErrors(
  async (req: Request, res: Response) => {
    const params = deleteUserParamsValidator.parse(req.params);

    const user = await UserRepository.findById(params.userID);
    if (!user) {
      throw new NotFoundError("User");
    }

    await UserRepository.deleteUser(params.userID);

    // Publish user profile deleted event
    await publishEvent("user.profile.deleted", {
      _id: params.userID,
    });

    res.status(200).json({ message: "User deleted successfully" });
  },
);
