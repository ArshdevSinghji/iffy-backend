import { Router } from "express";

import { getUserHandler } from "./get-user.handler";

const router = new Router();

router.get("/:userID", getUserHandler);

export default router;
