import { Router } from "express";

import getChatsRoute from "./get-chats/get-chats.route";
import getRoomsRoute from "./get-rooms/get-rooms.route";

const router = Router();

router.use("/rooms", getRoomsRoute);
router.use("/rooms", getChatsRoute);

export default router;
