import { Router } from "express";

import { updateUserHandler } from "./update-user.handler";

const router = Router();

router.put("/:userID", updateUserHandler);

export default router;
