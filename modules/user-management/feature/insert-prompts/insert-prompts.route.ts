import { Router } from "express";

import { insertPromptsHandler } from "./insert-prompts.handler";

const router = Router();

router.post("/:userID/prompts", insertPromptsHandler);

export default router;
