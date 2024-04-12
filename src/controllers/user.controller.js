import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOncloud } from '../utils/clodinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const genAccessAndRefreshTokens = async (user_id) => {
    try {
        const user = await User.findById(user_id)
        const accessTokens = user.generateAccessToken()
        const refreshTokens = user.generateRefreshToken()

        user.refreshToken = refreshTokens
        await user.save({ validateBeforeSave: false })

        return { accessTokens, refreshTokens }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token");

    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, username, email, password } = req.body;

    if ([fullname, username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Please provide all fields");
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existedUser) {
        throw new ApiError(409, `Username or Email is taken`);
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImgLocalPath = req.files?.coverImg[0]?.path;

    let coverImgLocalPath;
    if (req.files && Array.isArray(req.files.coverImg) && req.files.coverImg.lenght > 0) {
        coverImgLocalPath = req.files.coverImg[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(422, "Avatar file required");
    }

    const avatar = await uploadOncloud(avatarLocalPath);
    const coverImg = await uploadOncloud(coverImgLocalPath);

    if (!avatar) {
        throw new ApiError(422, "Avatar file is not uploaded properly");
    }

    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImg: coverImg?.url || ""
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    const responseUser = {
        _id: createdUser._id,
        fullname: createdUser.fullname,
        username: createdUser.username,
        email: createdUser.email,
        avatar: createdUser.avatar,
        coverImg: createdUser.coverImg
    };

    return res.status(201).json(
        new ApiResponse(200, responseUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    // req.body ->  data
    // login -> username or email
    // find the user in DB
    // if user not found -> throw error,  if user found -> compare password
    // access and refresh token
    // send cokies
    // send response

    const { username, email, password } = req.body

    if (!username || !email) {
        throw new ApiError(400, "Please provide username or email correctly");
    }

    const user = await User.findOne({
        $or: [
            { username: username.toLowerCase() },
            { email: email.toLowerCase() }
        ]
    })

    if (!user) {
        throw new ApiError(404, "user does not exits register first");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "password is not correct");
    }

    const { accessToken, refreshToken } = await genAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // cookies handling

    const option = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "user logged in successfully"
            )
        )
})

const userLogOut = asyncHandler(async (req, res) => {
  await  User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: null
            }
        },
        {
            new: true
        }
    )

    const option = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(
        new ApiResponse(
            200,
            null,
            "user logged out successfully"
        )
    )

})

export { registerUser, loginUser, userLogOut };
