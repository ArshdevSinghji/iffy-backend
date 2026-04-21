import { Request, Response } from "express";

import { NotFoundError } from "../../../../shared/errors";
import { catchErrors } from "../../../../shared/middleware";
import { UserRepository } from "../../infrastructure/repository/user.repository";
import { deleteUserParamsValidator } from "./delete-user.validator";

export const deleteUserHandler = catchErrors(
  async (req: Request, res: Response) => {
    const params = deleteUserParamsValidator.parse(req.params);

    const user = await UserRepository.findById(params.userID);
    if (!user) {
      throw new NotFoundError("User");
    }

    const result = await UserRepository.deleteUser(params.userID);
    res.status(201).json({ message: "User deleted successfully", result });
  },
);
