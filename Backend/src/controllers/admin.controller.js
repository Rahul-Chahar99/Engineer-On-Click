import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import redisClient from "../utils/redisClient.js";
import { BranchData } from "../models/branchData.model.js";
import { ApiResponse } from "../utils/Apiresponse.js";

const getPaginatedBankList = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  // Grab the search query from the frontend (default to empty string)
  const searchQuery = req.query.search ? req.query.search.toLowerCase() : "";

  const cacheKey = "admin_all_banksList";

  try {
    let allBanks = [];
    let source = "";

    // 1. Try to get from Redis
    const cacheData = await redisClient.get(cacheKey);

    if (cacheData) {
      console.log("Serving all bank details from Redis");
      allBanks = JSON.parse(cacheData);
      source = "Redis";
    } else {
      // 2. Cache miss: Fetch from MongoDB
      console.log("Serving Bank Details from MongoDB");
      // Do NOT use .lean() if you intend to modify the data.
      // If you need to fetch a document, update its values, and save it back to the database, leave .lean() off so you retain access to Mongoose's save mechanisms.
      allBanks = await BranchData.find({}).lean();

      // Save back to Redis for next time
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(allBanks));
      source = "MongoDB";
    }

    // 3. FILTER THE DATA BASED ON THE SEARCH QUERY FIRST
    let filteredBanks = allBanks;
    if (searchQuery) {
      filteredBanks = allBanks.filter((bank) =>
        // Make sure the field matches your database schema! (e.g., branchCode)
        bank.branchCode?.toLowerCase().includes(searchQuery)
      );
    }

    // 4. THEN PAGINATE THE FILTERED LIST
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedResults = filteredBanks.slice(startIndex, endIndex);

    // 5. Send Response
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          data: paginatedResults,
          currentPage: page,
          totalPages: Math.ceil(filteredBanks.length / limit),
          totalRecords: filteredBanks.length, // Total of the *searched* items
          source: source,
        },
        "Data fetched successfully"
      )
    );
  } catch (error) {
    throw new ApiError(500, "Internal Server Error");
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
