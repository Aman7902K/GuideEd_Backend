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

export { registerUser };