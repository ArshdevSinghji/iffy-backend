import { Router } from "express";

import { deleteGlimpseHandler } from "./delete-glimpse.handler";

const router = new Router();

router.delete("/:userID/glimpses/:glimpseID", deleteGlimpseHandler);

export default router;
