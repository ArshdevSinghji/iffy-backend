import { Request, Response } from "express";

import { catchErrors } from "../../../../shared/middleware";
import { InteractionRepository } from "../../infrastructure/repository/interaction.repository";
import { listLikersParamsValidator } from "./list-likers.validator";

export const listLikersHandler = catchErrors(
  async (req: Request, res: Response) => {
    const params = listLikersParamsValidator.parse(req.params);
    const likers = await InteractionRepository.findInteractionsOnUser(
      params.userID,
    );
    res.status(200).json(likers);
  },
);
