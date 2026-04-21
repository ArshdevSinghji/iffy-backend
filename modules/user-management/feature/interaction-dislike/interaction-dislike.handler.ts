import { Request, Response } from "express";

import { catchErrors } from "../../../../shared/middleware";
import { InteractionRepository } from "../../infrastructure/repository/interaction.repository";
import { interactionDislikeBodyValidator } from "./interaction-dislike.validator";

export const interactionDislikeHandler = catchErrors(
  async (req: Request, res: Response) => {
    const body = interactionDislikeBodyValidator.parse(req.body);

    const payload = body.dislikedIds.map((to) => ({
      from: body.from,
      to,
      type: "dislike" as const,
    }));

    await InteractionRepository.bulkCreateInteraction(payload);
    res.status(200).json({ message: "Interaction recorded" });
  },
);
