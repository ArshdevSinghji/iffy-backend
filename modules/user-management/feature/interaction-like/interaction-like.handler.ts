import { Request, Response } from "express";
import { Types } from "mongoose";

import { catchErrors } from "../../../../shared/middleware";
import { UserRepository } from "../../infrastructure/repository/user.repository";
import { InteractionRepository } from "../../infrastructure/repository/interaction.repository";
import { publishEvent } from "../../infrastructure/message-bus/message-bus.publisher";
import { interactionLikeBodyValidator } from "./interaction-like.validator";

export const interactionLikeHandler = catchErrors(
  async (req: Request, res: Response) => {
    const payload = interactionLikeBodyValidator.parse({
      params: req.params,
      ...req.body,
    });
    const userId = payload.params.userID;
    const profileId = payload.params.profileID;
    const comment = payload.comment
      ? ({
          ...payload.comment,
          glimpse: payload.comment.glimpse
            ? payload.comment.glimpse
            : undefined,
        } as const)
      : undefined;

    const existingInteraction = await InteractionRepository.findMatch(
      userId,
      profileId,
    );

    if (existingInteraction) {
      const marked = await existingInteraction.markAsMatch();
      const markedId = (
        marked as { _id: { toString(): string } }
      )._id.toString();
      const fromUser = (await UserRepository.findById(userId)) as {
        _id: { toString(): string };
        name?: string;
        persona?: string;
      } | null;
      const toUser = (await UserRepository.findById(profileId)) as {
        _id: { toString(): string };
        name?: string;
        persona?: string;
      } | null;

      // Publish user match created event with room data
      if (fromUser && toUser) {
        await publishEvent("user.match.created", {
          _id: markedId,
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

      res.status(200).json({ message: "Profile matched!" });
      return;
    }

    await InteractionRepository.createInteraction({
      from: new Types.ObjectId(userId),
      to: new Types.ObjectId(profileId),
      type: "like",
      comment: comment as never,
    });

    res.status(200).json({ message: "Profile liked!" });
  },
);
