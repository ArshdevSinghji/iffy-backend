import { Router } from "express";
import { createUserHandler } from "./create-user.handler";

const router = new Router();

router.post("/", createUserHandler);

export default router;
