import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, changePassword, getCurrentUser, changeFullname, changeEmail, changeUsername, updateUserAvatar, getWatchHistory } from "../controllers/user.controller.js"
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

router.route("/change-password").post(verifyJWT, changePassword)

router.route("/get-current-user").get(verifyJWT, getCurrentUser)

router.route("/change-fullname").put(verifyJWT, changeFullname)

router.route("/change-email").put(verifyJWT, changeEmail)

router.route("/change-username").put(verifyJWT, changeUsername)

router.route("/update-avatar").put(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }
]), verifyJWT, updateUserAvatar)

router.route("/get-watchHistory").get(verifyJWT, getWatchHistory)


export default router