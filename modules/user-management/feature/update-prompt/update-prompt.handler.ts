import { Request, Response } from "express";

import { NotFoundError } from "../../../../shared/errors";
import { catchErrors } from "../../../../shared/middleware";
import { UserRepository } from "../../infrastructure/repository/user.repository";
import {
  updatePromptBodyValidator,
  updatePromptParamsValidator,
} from "./update-prompt.validator";

export const updatePromptHandler = catchErrors(
  async (req: Request, res: Response) => {
    const params = updatePromptParamsValidator.parse(req.params);
    const body = updatePromptBodyValidator.parse(req.body);

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

    const result = await UserRepository.updatePrompt(
      params.userID,
      params.promptID,
      body.prompts,
    );

    res.status(201).json({
      message: "Prompt updated successfully",
      result,
    });
  },
);
