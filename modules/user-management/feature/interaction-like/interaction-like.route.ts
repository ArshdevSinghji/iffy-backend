import { Router } from "express";

import { interactionLikeHandler } from "./interaction-like.handler";

const router = Router();

router.post("/:userID/like/:profileID", interactionLikeHandler);

export default router;
