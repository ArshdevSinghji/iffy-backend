import { Router } from "express";

import { listLikersHandler } from "./list-likers.handler";

const router = new Router();

router.get("/:userID/likers", listLikersHandler);

export default router;
