import { Request, Response } from "express";

import { NotFoundError } from "../../../../shared/errors";
import { catchErrors } from "../../../../shared/middleware";
import { UserRepository } from "../../infrastructure/repository/user.repository";
import { deletePromptParamsValidator } from "./delete-prompt.validator";

export const deletePromptHandler = catchErrors(
  async (req: Request, res: Response) => {
    const params = deletePromptParamsValidator.parse(req.params);

    const user = await UserRepository.findById(params.userID);
    if (!user) {
      throw new NotFoundError("User");
    }

    const prompt = await UserRepository.findPromptById(
      params.userID,
      params.promptID,
    );
    if (!prompt) {
      throw new NotFoundError("Prompt");
    }

    const result = await UserRepository.deletePrompt(
      params.userID,
      params.promptID,
    );

    res.status(200).json({
      message: "Prompt deleted successfully",
      result,
    });
  },
);
