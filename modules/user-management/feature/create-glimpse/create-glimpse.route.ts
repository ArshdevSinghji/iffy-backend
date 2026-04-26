import { Router } from "express";
import multer from "multer";

import { BadRequestError } from "../../../../shared/errors";
import { createGlimpseHandler } from "./create-glimpse.handler";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new BadRequestError("Only image files are allowed"));
      return;
    }

    cb(null, true);
  },
  limits: { fileSize: 120 * 1024 * 1024 },
});

const requireFile = (req: any, _res: any, next: any) => {
  if (!req.file) {
    next(new BadRequestError("image file is required"));
    return;
  }

  next();
};

router.post(
  "/:userID/glimpses",
  upload.single("image"),
  requireFile,
  createGlimpseHandler,
);

export default router;
