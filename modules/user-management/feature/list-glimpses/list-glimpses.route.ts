import { Router } from "express";

import { listGlimpsesHandler } from "./list-glimpses.handler";

const router = Router();

router.get("/:userID/glimpses", listGlimpsesHandler);

export default router;
