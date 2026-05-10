import { Request, Response } from "express";
import { Types } from "mongoose";

import { catchErrors } from "../../../../shared/middleware";
import { InteractionRepository } from "../../infrastructure/repository/interaction.repository";
import { interactionDislikeBodyValidator } from "./interaction-dislike.validator";

export const interactionDislikeHandler = catchErrors(
  async (req: Request, res: Response) => {
    const body = interactionDislikeBodyValidator.parse({
      params: req.params,
      ...req.body,
    });
    const userId = body.params.userID as unknown as Types.ObjectId;
    const profileId = body.params.profileID as unknown as Types.ObjectId;

    await InteractionRepository.createInteraction({
      from: userId,
      to: profileId,
      type: "dislike",
    });
    res.status(200).json({ message: "Profile disliked!" });
  },
);
