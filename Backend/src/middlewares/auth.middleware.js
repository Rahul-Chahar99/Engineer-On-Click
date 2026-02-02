import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Middleware to verify JWT token for protected routes
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Try to retrieve the token from cookies first, then fallback to Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Verify the token using the secret key
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find the user associated with the token, excluding sensitive info like password
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    // Attach the user object to the request so subsequent controllers can access it
    req.user = user;
    next(); // Proceed to the next middleware or controller
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});


//middleware to check admin role

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    throw new ApiError(403, "Access denied. Admin role required.");
  }
};

export const isCoustomer = (req, res, next)=>{
  if(req.user && req.user.role === "customer"){
    next();
  }
  else{
    throw new ApiError(403,"Access denied. Customer role required.")
  }
}