import { Request, Response } from "express";

import { catchErrors } from "../../../../shared/middleware";
import { UserRepository } from "../../infrastructure/repository/user.repository";
import { InteractionRepository } from "../../infrastructure/repository/interaction.repository";
import { publishEvent } from "../../infrastructure/message-bus/message-bus.publisher";
import { interactionLikeBodyValidator } from "./interaction-like.validator";

export const interactionLikeHandler = catchErrors(
  async (req: Request, res: Response) => {
    const body = interactionLikeBodyValidator.parse(req.body);

    const existingInteraction = await InteractionRepository.findMatch(
      body.from,
      body.to,
    );

    if (existingInteraction) {
      const marked = await existingInteraction.markAsMatch();

      // Publish user match created event with room data
      const fromUser = await UserRepository.findById(body.from);
      const toUser = await UserRepository.findById(body.to);

      if (fromUser && toUser) {
        await publishEvent("user.match.created", {
          _id: marked._id.toString(),
          participants: {
            one: {
              _id: fromUser._id.toString(),
              name: fromUser.name || "",
              persona: fromUser.persona || "",
            },
            two: {
              _id: toUser._id.toString(),
              name: toUser.name || "",
              persona: toUser.persona || "",
            },
          },
        });
      }

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
