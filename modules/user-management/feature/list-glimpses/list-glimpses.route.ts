import { Router } from "express";

import { listGlimpsesHandler } from "./list-glimpses.handler";

const router = new Router();

router.get("/:userID/glimpses", listGlimpsesHandler);

export default router;
