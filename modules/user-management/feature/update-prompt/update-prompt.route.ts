import { Router } from "express";

import { updatePromptHandler } from "./update-prompt.handler";

const router = Router();

router.put("/:userID/prompts/:promptID", updatePromptHandler);

export default router;
