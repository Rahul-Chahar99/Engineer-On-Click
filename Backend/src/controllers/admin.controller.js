import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import redisClient from "../utils/redisClient.js";
import { BranchData } from "../models/branchData.model.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { response } from "express";

const getAllBranches = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  // Grab the search query from the frontend (default to empty string)
  const searchQuery = req.query.search ? req.query.search.trim() : "";

  const cacheKey = `get_all_banks_page=${page}_limit=${limit}_searchQuery=${searchQuery.toLowerCase()}`;

  try {
    let responseData = null;
    let source = "";

    // 1. Try to get from Redis
    try {
      const cacheData = await redisClient.get(cacheKey);

      if (cacheData) {
        console.log("Serving all bank details from Redis");
        responseData = JSON.parse(cacheData);
        source = "Redis";
      }
    } catch (error) {
      console.error("Redis fetch error (Banks): ", error);
    }
    if (!responseData) {
      console.log("Serving Bank Details from MongoDB");

      const query = {};

      if (searchQuery) {
        query.$or = [
          { branchCode: { $regex: searchQuery, $options: "i" } },
          { branchName: { $regex: searchQuery, $options: "i" } },
        ];
      }
      // 2. Cache miss: Fetch from MongoDB
      const totalRecords = await BranchData.countDocuments(query);
      const skip = (page - 1) * limit;

      const allBanks = await BranchData.find(query)
        .skip(skip)
        .limit(limit)
        .lean();

      responseData = {
        data: allBanks,
        totalRecords: totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
      };

      source = "MongoDB";
      try {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));
      } catch (error) {
        console.error("Redis cache set error (Banks):", error);
      }
    }

    responseData.source = source;
    // 5. Send Response
    return res
      .status(200)
      .json(new ApiResponse(200, responseData, "Data fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Internal Server Error");
  }
});

const generateAccessAndRefreshToken = async (userId) => {
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

export { getAllBranches, generateAccessAndRefreshToken };
