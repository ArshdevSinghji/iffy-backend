import { Router } from "express";
import { createUserHandler } from "./create-user.handler";

const router = Router();

router.post("/", createUserHandler);

export default router;
