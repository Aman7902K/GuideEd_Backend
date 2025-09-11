import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
    // 1. Get user details from request body
    const { name, email, password } = req.body;

    // 2. Validate that no fields are empty
    if ([name, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // 3. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    // 4. Create new user in the database
    // The password will be automatically hashed by the pre-save hook in your user.model.js
    const user = await User.create({
        name,
        email,
        password,
        authProvider: 'email', // As defined in your schema
    });

    // 5. Retrieve the created user without the password field
    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // 6. Send a success response
    return res.status(201).json(
        new ApiResponse(201, "User registered successfully", createdUser)
    );
});

const loginUser = asyncHandler(async (req, res) => {
    // 1. Get email and password from request body
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // 2. Find user by email
    const user = await User.findOne({ email }).select("+password"); // Explicitly request password
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // 3. Compare the password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // 4. Generate access and refresh tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // 5. Save refresh token to the database and remove password from output
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    const loggedInUser = await User.findById(user._id).select("-password");

    const options = {
        httpOnly: true,
        secure: true // Set to true in production
    }

    // 6. Send tokens via cookies and as a JSON response
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                "User logged in successfully",
                { user: loggedInUser, accessToken, refreshToken }
            )
        );
});

export { registerUser,loginUser  };