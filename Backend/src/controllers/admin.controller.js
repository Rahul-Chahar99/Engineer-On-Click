import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

export const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating the accessToken and refreshToken "
    );
  }
};



export const getDashBoardStats = asyncHandler(async (req, res) => {
    // 1 get total number of users
    // 2.get total number of customers
    //3. get total number of orders
    //4.get total number of contact forms 
    
});
