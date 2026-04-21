import { Router } from "express";

import { updatePromptHandler } from "./update-prompt.handler";

const router = new Router();

router.put("/:userID/prompts/:promptID", updatePromptHandler);

export default router;
