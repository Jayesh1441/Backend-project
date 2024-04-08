import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOncloud } from '../utils/clodinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'


const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validate the  data
    // check for user already exists : username, avatar
    // check for images, avatar
    // upload images, avatar on cloudniry
    // crate new user object : new entry of user in DB
    // remove password and refresh field from response
    // check for user creation
    // return res

    const { fullname, username, email, password } = req.body
    console.log("username:", username);
    console.log("email:", email);

    if (
        [fullname, username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "Please provide all fields")
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, `Username or Email is taken`)
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImgLocalPath = req.files?.coverImg[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(422, "Avatar file required")
    }

    const avatar = await uploadOncloud(avatarLocalPath)
    const coverImg = await uploadOncloud(coverImgLocalPath)

    if (!avatar) {
        throw new ApiError(422, "avatar file is not uploaded properly")
    }

    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImg: coverImg?.url || ""
    })

    const createdUser = User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registring the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )
});

export { registerUser };
