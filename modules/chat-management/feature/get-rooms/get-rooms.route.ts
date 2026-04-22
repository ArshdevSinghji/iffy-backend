import { Router } from "express";

import { getRoomsHandler } from "./get-rooms.handler";

const router = Router();

router.get("/", getRoomsHandler);

export default router;
