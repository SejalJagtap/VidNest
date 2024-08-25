import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary, uploadVideoOnCloudinary } from "../utils/cloudinary.js";

const uploadVideo = AsyncHandler(async (req, res) => {
    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    const { title, description } = req.body
    if (!title || !description) {
        if (videoLocalPath && fs.existsSync(videoLocalPath)) {
            fs.unlinkSync(videoLocalPath);
        }
        if (thumbnailLocalPath && fs.existsSync(thumbnailLocalPath)) {
            fs.unlinkSync(thumbnailLocalPath);
        }
        return res.status(400).json({ message: "Fill all details" });
    }
    if (!videoLocalPath) {
        return res.status(400).json({ message: "video file is required" })
    }
    if (!thumbnailLocalPath) {
        return res.status(400).json({ message: "thumbnail file is required" })
    }


    const video = await uploadVideoOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)



    if (!video) {
        await deleteOnCloudinary(thumbnail?.url)
        return res.status(500).json({
            message: "Failed to upload video"
        })
    }
    if (video.resource_type !== 'video') {
        return res.status(400).json({
            message: "only videoo file is expected"
        })
    }
    console.log(video)
    if (!thumbnail) {
        return res.status(500).json({
            message: "Failed to upload thumbnail"
        })
    }
    // const owner = new mongoose.Types.ObjectId(req.user._id)
    // console.log(owner)
    const response = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title,
        description,
        owner: new mongoose.Types.ObjectId(req.user._id)
    })

    const uploadedVideo = await Video.findById(response._id);
    if (!uploadedVideo) {
        return res.status(400).json({ message: "Something went wrong while registering user" })
    }


    return res.status(200).json({ uploadedVideo });

})

const watchVideo = AsyncHandler(
    async (req, res) => {
        const { videoID } = req.params;

        console.log(videoID)
        if (!videoID) {
            return res.status(400).json({ message: "Video ID is required" });
        }


        const video = await Video.findByIdAndUpdate(
            videoID,
            {
                $inc: { views: 1 }
            },
            { new: true }
        );


        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.watchHistory.push(video._id);
        await user.save();


        return res.status(200).json({ video, message: "Video fetched successfully" });
    }
);


export { uploadVideo, watchVideo }