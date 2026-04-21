import { Request, Response } from "express";

import { NotFoundError } from "../../../../shared/errors";
import { catchErrors } from "../../../../shared/middleware";
import { UserRepository } from "../../infrastructure/repository/user.repository";
import {
  getUserParamsValidator,
  getUserQueryValidator,
} from "./get-user.validator";

export const getUserHandler = catchErrors(
  async (req: Request, res: Response) => {
    const params = getUserParamsValidator.parse(req.params);
    const query = getUserQueryValidator.parse(req.query);

    const projection = query.fields ? query.fields.split(",").join(" ") : "";
    const user = await UserRepository.findById(params.userID, projection);

    if (!user) {
      throw new NotFoundError("User");
    }

    res.status(200).json(user);
  },
);
