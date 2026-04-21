import { Request, Response } from "express";

import { catchErrors } from "../../../../shared/middleware";
import { InteractionRepository } from "../../infrastructure/repository/interaction.repository";
import { interactionLikeBodyValidator } from "./interaction-like.validator";

export const interactionLikeHandler = catchErrors(
  async (req: Request, res: Response) => {
    const body = interactionLikeBodyValidator.parse(req.body);

    const existingInteraction = await InteractionRepository.findMatch(
      body.from,
      body.to,
    );

    if (existingInteraction) {
      await existingInteraction.markAsMatch();
      res.status(200).json({ message: "Interaction recorded" });
      return;
    }

    await InteractionRepository.createInteraction({
      from: body.from,
      to: body.to,
      type: "like",
      comment: body.comment,
    });

    res.status(200).json({ message: "Interaction recorded" });
  },
);
