import { AsyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from 'fs';


const registerUser = AsyncHandler(async (req, res) => {
    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;

    if (req.files && req.files.coverImage && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    try {
        const { email, username, fullname, password } = req.body;
        console.log(email, username, fullname, password);


        if (!fullname) {
            res.status(400);
            throw new Error("Fullname cannot be kept empty");
        }
        if (!email) {
            res.status(400);
            throw new Error("Email cannot be kept empty");
        }
        if (!username) {
            res.status(400);
            throw new Error("Username cannot be kept empty");
        }
        if (!password) {
            res.status(400);
            throw new Error("Password cannot be kept empty");
        }

        // Check if user already exists
        const existedEmail = await User.findOne({ email });
        const existedUsername = await User.findOne({ username });

        if (existedEmail) {
            res.status(409);
            throw new Error("User already exists with this email");
        }
        if (existedUsername) {
            res.status(409);
            throw new Error("User already exists with this username");
        }


        if (!avatarLocalPath) {
            res.status(400);
            throw new Error("Avatar file is required");
        }

        // Upload files to Cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath);

        let coverImage;
        if (coverImageLocalPath) {
            coverImage = await uploadOnCloudinary(coverImageLocalPath);
        }




        if (!avatar) {
            res.status(500);
            throw new Error("Failed to upload avatar file");
        }

        // Create user in the database
        const user = await User.create({
            fullname,
            email,
            password,
            username: username.toLowerCase(),
            avatar: avatar.url,
            coverImage: coverImage?.url || ""
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken");
        if (!createdUser) {
            res.status(500);
            throw new Error("Something went wrong while registering user");
        }


        return res.status(200).json({ createdUser });

    } catch (err) {
        // Clean up uploaded files if any error occurs
        if (avatarLocalPath && fs.existsSync(avatarLocalPath)) {
            fs.unlinkSync(avatarLocalPath);
        }
        if (coverImageLocalPath && fs.existsSync(coverImageLocalPath)) {
            fs.unlinkSync(coverImageLocalPath);
        }


        return res.status(res.statusCode || 500).json({ Error: err.message });
    }
});


const loginUser = AsyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email) {
        return res.status(400).json({ Error: "Email is required" });
    }
    if (!password) {
        return res.status(400).json({ Error: "Password is required" });
    }

    // if login can be don using both username or email
    // const user = await User.findOne(
    //     {
    //         $or:[email,username]  
    //     });

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ Error: "Invalid email or password" });
    }


    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        return res.status(401).json({ Error: "Invalid email or password" });
    }
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();



    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: true
    }
    // Return tokens to the client
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            user: {
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                avatar: user.avatar,
                coverImage: user.coverImage,

            },
            accessToken: accessToken,
            refreshToken: refreshToken,
            message: "user logged in succesfully"
        })


})

const logoutUser = AsyncHandler(async (req, res) => {
    //first collect accessToken from cookies or header from req - use middleware for this
    //decode information from accesstoken
    //search user by id in db 
    // expire accesstoken of that user and refresh toke also
    User.findByIdAndUpdate(req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            },
        },

        {
            new: true
        }

    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({ message: "User logged out succesfully" })
})

const refreshAccessToken = AsyncHandler(async (req, res) => {
    const user = req.user;
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();


    // console.log(refreshToken, accessToken)

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: true
    }
    // Return tokens to the client
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            user: {
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                avatar: user.avatar,
                coverImage: user.coverImage,

            },
            accessToken: accessToken,
            refreshToken: refreshToken,
            message: "Access token refreshed "
        })
})

const changePassword = AsyncHandler(
    async (req, res) => {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id)
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
        if (!isPasswordCorrect) {
            res.status(400).json({ message: "Invalid old password" })
            throw new Error("Invalid old password")
        }
        user.password = newPassword

        await user.save({ validateBeforeSave: false })
        return res.status(200).json({ message: "password successfully changed" })
    }
)

const getCurrentUser = AsyncHandler(async (req, res) => {
    return res.status(200).json({ user: req.user, message: "succesfully user fetched" })
})

const changeEmail = AsyncHandler(async (req, res) => {
    const { email } = req.body
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    const existedEmail = await User.findOne({ email });


    if (existedEmail) {
        res.status(409);
        throw new Error("User already exists with this email");
    }


    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                email: email
            }
        },
        { new: true }

    ).select("-password -refreshToken")
    return res.status(200).json({ user, message: "Email updated successfully" })


})
const changeFullname = AsyncHandler(async (req, res) => {
    const { fullname } = req.body
    if (!fullname) {
        return res.status(400).json({ message: "Fullname is required" });
    }





    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname: fullname
            }
        },
        { new: true }

    ).select("-password -refreshToken")
    return res.status(200).json({ user, message: "Fullname updated successfully" })


})
const changeUsername = AsyncHandler(async (req, res) => {
    const { username } = req.body
    if (!username) {
        return res.status(400).json({ message: "username is required" });
    }
    const existedUsername = await User.findOne({ username });


    if (existedUsername) {
        res.status(409);
        throw new Error("User already exists with this email");
    }


    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                username: username
            }
        },
        { new: true }

    ).select("-password -refreshToken")
    return res.status(200).json({ user, message: "username updated successfully" })


})
const updateUserAvatar = AsyncHandler(async (req, res) => {
    const avatarLocalPath = req.files?.avatar[0]?.path;

    if (!avatarLocalPath) {
        return res.status(400).json({ message: "Avatar file is missing" })

    }



    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")

    }
    const oldAvatar = req.user.avatar
    await deleteOnCloudinary(oldAvatar)

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            { message: "Avatar updated succesfully", user }
        )
})



// const updateUserCoverImage = asyncHandler(async (req, res) => {
//     const coverImageLocalPath = req.file?.path

//     if (!coverImageLocalPath) {
//         throw new ApiError(400, "Cover image file is missing")
//     }

//     //TODO: delete old image - assignment


//     const coverImage = await uploadOnCloudinary(coverImageLocalPath)

//     if (!coverImage.url) {
//         throw new ApiError(400, "Error while uploading on avatar")

//     }

//     const user = await User.findByIdAndUpdate(
//         req.user?._id,
//         {
//             $set: {
//                 coverImage: coverImage.url
//             }
//         },
//         { new: true }
//     ).select("-password")

//     return res
//         .status(200)
//         .json(
//             new ApiResponse(200, user, "Cover image updated successfully")
//         )
// })


export { registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser, changePassword, changeFullname, changeEmail, changeUsername, updateUserAvatar };
