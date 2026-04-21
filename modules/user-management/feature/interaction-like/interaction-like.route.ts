import { Router } from "express";

import { interactionLikeHandler } from "./interaction-like.handler";

const router = new Router();

router.post("/like", interactionLikeHandler);

export default router;
