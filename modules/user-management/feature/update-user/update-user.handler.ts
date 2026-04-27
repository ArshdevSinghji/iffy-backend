import { Request, Response } from "express";

import { NotFoundError } from "../../../../shared/errors";
import { catchErrors } from "../../../../shared/middleware";
import { UserRepository } from "../../infrastructure/repository/user.repository";
import { publishEvent } from "../../infrastructure/message-bus/message-bus.publisher";
import {
  updateUserBodyValidator,
  updateUserParamsValidator,
} from "./update-user.validator";

export const updateUserHandler = catchErrors(
  async (req: Request, res: Response) => {
    const params = updateUserParamsValidator.parse(req.params);
    const body = updateUserBodyValidator.parse(req.body);

    const user = await UserRepository.findById(params.userID);
    if (!user) {
      throw new NotFoundError("User");
    }

    const payload = {
      ...body,
      isProfileComplete: user.isProfileComplete ? user.isProfileComplete : true,
    };

    await UserRepository.updateUserDetails(params.userID, payload);

    // Publish user profile update event
    if (body.name || body.persona) {
      await publishEvent("user.profile.update", {
        _id: params.userID,
        name: body.name || user.name || "",
        persona: body.persona || user.persona || "",
      });
    }

    res.status(200).json({ message: "User updated successfully" });
  },
);
