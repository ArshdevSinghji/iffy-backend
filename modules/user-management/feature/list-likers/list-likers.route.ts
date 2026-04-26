import { Router } from "express";

import { listLikersHandler } from "./list-likers.handler";

const router = Router();

router.get("/:userID/likers", listLikersHandler);

export default router;
