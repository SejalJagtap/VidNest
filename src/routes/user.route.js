import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js"
const router = Router()
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT, verifyRefreshToken } from "../middlewares/auth.middleware.js";
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, {
            name: "coverImage",
            maxCount: 2,
        }
    ]),
    registerUser)
router.route("/login").post(
    loginUser
)
router.route("/logout").post(
    verifyJWT, logoutUser
)

router.route("/refresh-token").post(verifyRefreshToken, refreshAccessToken)

export default router