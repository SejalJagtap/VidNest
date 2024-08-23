import jwt from "jsonwebtoken"
import { AsyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"
const verifyJWT = AsyncHandler(
    async (req, res, next) => {
        try {
            const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
            if (!token) {
                res.status(401).json({ message: "Unauthorized request" })
                throw new Error("Unauthorized request");

            }
            const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

            if (!decodedToken) {
                res.status(401).json({ message: "Invalid access token" })
                throw new Error("Invalid access token");

            }

            const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
            console.log(user)
            if (!user) {
                res.status(401).json({ message: "Invalid access token" })
                throw new Error("Invalid access token");
            }

            req.user = user


            next()
        } catch (error) {
            return res
        }
    }
)


const verifyRefreshToken = AsyncHandler(
    (async (req, res, next) => {
        try {
            const receivedRefreshToken = req.cookies.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
            // console.log(receivedRefreshToken)
            if (!receivedRefreshToken) {
                res.status(401).json({ message: "Unauthorized request" })
                throw new Error("Unauthorized request");
            }

            const decodedToken = await jwt.verify(receivedRefreshToken, process.env.REFRESH_TOKEN_SECRET);
            // console.log(decodedToken)

            if (!decodedToken) {
                res.status(401).json({ message: "Invalid access token" })
                throw new Error("Invalid access token");

            }
            const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
            // console.log(user)
            if (!user) {
                res.status(401).json({ message: "Invalid access token" })
                throw new Error("Invalid access token");
            }

            req.user = user;
            next()

        } catch (error) {
            return res
        }

    })
)

export { verifyJWT, verifyRefreshToken }