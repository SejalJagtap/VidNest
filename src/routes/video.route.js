import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadVideo, watchVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router()

router.use(verifyJWT)

router.route("/upload-video").post(upload.fields([
    {
        name: "videoFile",
        maxCount: 1
    }, {
        name: "thumbnail",
        maxCount: 2,
    }
]), uploadVideo)

router.route("/c/:videoID").get(watchVideo)

export default router