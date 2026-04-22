import { Router } from "express";

import interactionDislikeRoute from "../interaction-dislike/interaction-dislike.route";
import interactionLikeRoute from "../interaction-like/interaction-like.route";

const router = Router();

router.use("/interaction", interactionLikeRoute);
router.use("/interaction", interactionDislikeRoute);

export default router;
