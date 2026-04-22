import { Request, Response } from "express";

import { catchErrors } from "../../../../shared/middleware";
import { GlimpseRepository } from "../../infrastructure/repository/glimpse.repository";
import { listGlimpsesParamsValidator } from "./list-glimpses.validator";

export const listGlimpsesHandler = catchErrors(
  async (req: Request, res: Response) => {
    const params = listGlimpsesParamsValidator.parse(req.params);
    const glimpses = await GlimpseRepository.findGlimpses(params.userID);
    res.status(200).json(glimpses);
  },
);
