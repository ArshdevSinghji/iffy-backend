import { Router } from "express";

import { insertPromptsHandler } from "./insert-prompts.handler";

const router = Router();

router.put("/:userID/prompts", insertPromptsHandler);

export default router;
