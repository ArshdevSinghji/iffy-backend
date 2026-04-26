import { Router } from "express";

import { interactionLikeHandler } from "./interaction-like.handler";

const router = Router();

router.post("/like", interactionLikeHandler);

export default router;
