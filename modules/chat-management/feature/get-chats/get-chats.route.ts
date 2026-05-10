import { Router } from "express";

import { getChatsHandler } from "./get-chats.handler";

const router = Router();

router.get("/:roomId/chats", getChatsHandler);

export default router;
