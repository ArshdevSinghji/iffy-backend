import { Router } from "express";

import { listUsersHandler } from "./list-users.handler";

const router = new Router();

router.get("/", listUsersHandler);

export default router;
