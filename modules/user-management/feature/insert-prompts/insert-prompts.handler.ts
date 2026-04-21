import { Request, Response } from "express";

import { NotFoundError } from "../../../../shared/errors";
import { catchErrors } from "../../../../shared/middleware";
import { UserRepository } from "../../infrastructure/repository/user.repository";
import {
  insertPromptsBodyValidator,
  insertPromptsParamsValidator,
} from "./insert-prompts.validator";

export const insertPromptsHandler = catchErrors(
  async (req: Request, res: Response) => {
    const params = insertPromptsParamsValidator.parse(req.params);
    const body = insertPromptsBodyValidator.parse(req.body);

    const user = await UserRepository.findById(params.userID);
    if (!user) {
      throw new NotFoundError("User");
    }

    const result = await UserRepository.addBulkPrompts(
      params.userID,
      body.prompts,
    );

    res.status(201).json({
      message: "Bulk prompts added successfully",
      result,
    });
  },
);
