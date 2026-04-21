import { Router } from "express";

import { updateUserHandler } from "./update-user.handler";

const router = new Router();

router.put("/:userID", updateUserHandler);

export default router;
