import { Router } from "express";
import createUserRoute from "./create-user/create-user.route";
import deletePromptRoute from "./delete-prompt/delete-prompt.route";
import deleteGlimpseRoute from "./delete-glimpse/delete-glimpse.route";
import deleteUserRoute from "./delete-user/delete-user.route";
import getUserRoute from "./get-user/get-user.route";
import insertPromptsRoute from "./insert-prompts/insert-prompts.route";
import listGlimpsesRoute from "./list-glimpses/list-glimpses.route";
import listLikersRoute from "./list-likers/list-likers.route";
import listUsersRoute from "./list-users/list-users.route";
import createGlimpseRoute from "./create-glimpse/create-glimpse.route";
import updatePromptRoute from "./update-prompt/update-prompt.route";
import updateUserRoute from "./update-user/update-user.route";
import likeInteractionRoute from "./interaction-like/interaction-like.route";
import dislikeInteractionRoute from "./interaction-dislike/interaction-dislike.route";

const router = Router();

router.use("/users", createUserRoute);
router.use("/users", listUsersRoute);
router.use("/users", getUserRoute);
router.use("/users", updateUserRoute);
router.use("/users", deleteUserRoute);
router.use("/users", insertPromptsRoute);
router.use("/users", updatePromptRoute);
router.use("/users", deletePromptRoute);
router.use("/users", listLikersRoute);
router.use("/users", listGlimpsesRoute);
router.use("/users", createGlimpseRoute);
router.use("/users", deleteGlimpseRoute);
router.use("/users", likeInteractionRoute);
router.use("/users", dislikeInteractionRoute);

export default router;
