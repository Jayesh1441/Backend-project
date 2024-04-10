import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOncloud } from '../utils/clodinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'


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

export { registerUser };
