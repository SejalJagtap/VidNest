import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import toggleSubscribeChannel from "../controllers/subscription.controller.js";

const router = Router()
router.use(verifyJWT)

router.route("/c/:username").post(toggleSubscribeChannel)

export default router