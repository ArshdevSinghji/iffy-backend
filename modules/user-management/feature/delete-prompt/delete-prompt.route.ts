import { Router } from "express";

import { deletePromptHandler } from "./delete-prompt.handler";

const router = Router();

router.delete("/:userID/prompts/:promptID", deletePromptHandler);

export default router;
