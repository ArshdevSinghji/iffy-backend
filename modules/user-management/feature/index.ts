import { Router } from "express";
import createUserRoute from "./create-user/create-user.route";
import deletePromptRoute from "./delete-prompt/delete-prompt.route";
import deleteUserRoute from "./delete-user/delete-user.route";
import getUserRoute from "./get-user/get-user.route";
import insertPromptsRoute from "./insert-prompts/insert-prompts.route";
import interactionDislikeRoute from "./interaction-dislike/interaction-dislike.route";
import interactionLikeRoute from "./interaction-like/interaction-like.route";
import listLikersRoute from "./list-likers/list-likers.route";
import listUsersRoute from "./list-users/list-users.route";
import updatePromptRoute from "./update-prompt/update-prompt.route";
import updateUserRoute from "./update-user/update-user.route";

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
router.use("/interaction", interactionLikeRoute);
router.use("/interaction", interactionDislikeRoute);

export default router;
