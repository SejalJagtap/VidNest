import { AsyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
const registerUser = AsyncHandler(async (req, res) => {
    //Algorithm
    // get user details from user - email username password fullname avatar coverimage
    // validation - not empty
    //check if user exists- through email
    //check for images, chaek for valatar
    //upload on cloudinary, avatar
    //create user object-create entry in db
    // remove password and refresh token field from response
    // check for user creation
    //return res

    const { email, username, fullname, password } = req.body
    console.log(email, username, fullname, password, avatar, coverImage);

    if (fullname === "") {
        throw new Error("fullname cannot be kept empty");
    }
    if (email === "") {
        throw new Error("email cannot be kept empty");
    }
    if (username === "") {
        throw new Error("username cannot be kept empty");
    }
    if (password === "") {
        throw new Error("password cannot be kept empty");
    }

    const existedUser = await User.findOne({ email })

    if (existedUser) {
        throw new Error("user already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    if (!avatarLocalPath) {
        throw new Error("avatar file is required");

    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new Error("avatar file is required");

    }

    const user = await User.create(
        {
            fullname,
            email,
            password,
            username: username.toLowerCase(),
            avatar: avatar.url,
            coverImage: coverImage.url || ""
        }
    )
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new Error("Something went wrong while registering user");

    }
    return res.status(200).json({ createdUser })




})
export { registerUser }