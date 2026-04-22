import { Request, Response } from "express";
import sharp from "sharp";

import { BadRequestError } from "../../../../shared/errors";
import { catchErrors } from "../../../../shared/middleware";
import { GlimpseRepository } from "../../infrastructure/repository/glimpse.repository";
import { detectFace, uploadToR2 } from "../../utils";
import {
  createGlimpseBodyValidator,
  createGlimpseParamsValidator,
} from "./create-glimpse.validator";

export const createGlimpseHandler = catchErrors(
  async (req: Request, res: Response) => {
    const params = createGlimpseParamsValidator.parse(req.params);
    const body = createGlimpseBodyValidator.parse(req.body);
    const imageBuffer = (
      req as Request & {
        file?: { buffer: Buffer };
      }
    ).file?.buffer;

    if (!imageBuffer) {
      throw new BadRequestError("image file is required");
    }

    const hasFace = await detectFace(imageBuffer);

    if (hasFace) {
      throw new BadRequestError("Image contains a face, which is not allowed.");
    }

    const optimizedBuffer = await sharp(imageBuffer)
      .resize(1080, 1350, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `glimpses/${params.userID}-${Date.now()}.webp`;
    const imageURL = await uploadToR2(optimizedBuffer, fileName);

    const glimpse = await GlimpseRepository.createGlimpse({
      userID: params.userID,
      imageURL,
      caption: body.caption,
    });

    res.status(201).json(glimpse);
  },
);
