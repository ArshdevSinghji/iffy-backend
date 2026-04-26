import { Router } from "express";

import { deleteUserHandler } from "./delete-user.handler";

const router = Router();

router.delete("/:userID", deleteUserHandler);

export default router;
