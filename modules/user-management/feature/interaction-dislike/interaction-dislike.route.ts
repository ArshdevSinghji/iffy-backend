import { Router } from "express";

import { interactionDislikeHandler } from "./interaction-dislike.handler";

const router = Router();

router.post("/:userID/dislike/:profileID", interactionDislikeHandler);

export default router;
