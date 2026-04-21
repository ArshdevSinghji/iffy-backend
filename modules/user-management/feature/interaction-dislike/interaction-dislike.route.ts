import { Router } from "express";

import { interactionDislikeHandler } from "./interaction-dislike.handler";

const router = new Router();

router.post("/dislike", interactionDislikeHandler);

export default router;
