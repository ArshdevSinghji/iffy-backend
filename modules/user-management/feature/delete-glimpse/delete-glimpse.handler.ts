import { Request, Response } from "express";

import { NotFoundError } from "../../../../shared/errors";
import { catchErrors } from "../../../../shared/middleware";
import { GlimpseRepository } from "../../infrastructure/repository/glimpse.repository";
import { deleteGlimpseParamsValidator } from "./delete-glimpse.validator";

export const deleteGlimpseHandler = catchErrors(
  async (req: Request, res: Response) => {
    const params = deleteGlimpseParamsValidator.parse(req.params);
    const glimpse = await GlimpseRepository.findGlimpseById(
      params.userID,
      params.glimpseID,
    );

    if (!glimpse) {
      throw new NotFoundError("Glimpse");
    }

    await GlimpseRepository.deleteGlimpse(params.userID, params.glimpseID);
    res.status(200).json({ message: "Glimpse deleted successfully" });
  },
);
