import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import redisClient from "../utils/redisClient.js";
import { BranchData } from "../models/branchData.model.js";
import { ApiResponse } from "../utils/Apiresponse.js";

const getPaginatedBankList = asyncHandler(async (req, res) => {
  // 1.setup paginated variable
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const cacheKey = "admin_all_banksList";
  try {
    //2. check redis for the master list
    const cacheData = await redisClient.get(cacheKey);
    if (cacheData) {
      console.log("serving all bank details from redis");
      const allBanks = JSON.parse(cacheData);

      // 3.paginate the array in-memory
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedResults = allBanks.slice(startIndex, endIndex);

      //returning response
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            data: paginatedResults,
            currentPage: page,
            totalPages: Math.ceil(allBanks.length / limit),
            totalRecords: allBanks.length,
            source: "Redis",
          },
          "data fetched successfully"
        )
      );
    }
    // 4.Cache miss: fetch all from mongo db
    console.log("Serving Bank Details from MongoDB");
    // .lean() makes the query faster by returning plain JS objects instead of Mongoose documents
    const allBanks = await BranchData.find({}).lean();

    // 5.  Save the Master List to Redis (Set TTL to 1 hour / 3600 seconds)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(allBanks));

    // 6. Paginate the fresh database results
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedResults = allBanks.slice(startIndex, endIndex);
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          data: paginatedResults,
          currentPage: page,
          totalPages: Math.ceil(allBanks.length / limit),
          totalRecords: allBanks.length,
          source: "MongoDB",
        },
        "data fetched successfully"
      )
    );
  } catch (error) {
    console.error("Redis Cache/MongoDB Error: ", error);
    throw new ApiError(500, error.message || "Internal Server Error");
  }
});

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

export { getPaginatedBankList };
