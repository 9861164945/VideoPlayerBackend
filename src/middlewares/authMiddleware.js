import { User } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Extract token from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "").trim();

    // Check if token exists
    if (!token) {
      throw new ApiError(401, "Unauthorized request. Token not provided.");
    }

    // Verify the token
    const decodedTokenInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Fetch user based on token payload
    const user = await User.findById(decodedTokenInfo?._id).select(
      "-password refreshToken"
    );

    // Check if user exists
    if (!user) {
      throw new ApiError(401, "Invalid access token. User not found.");
    }

    // Attach user to the request object
    req.user = user;

    // Proceed to the next middleware
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid token");
  }
});
