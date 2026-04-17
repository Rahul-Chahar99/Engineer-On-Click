import redisClient from "../utils/redisClient.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const rateLimitMiddleware = asyncHandler(async (req, res, next) => {
  const key = `rate_limit:${req.ip}`;
  console.log('req.ip->>>',req.ip);
  
  console.log("key->>>>>'", key);
  
  const maxRequest = 5;
  const timeWindow = 60; //seconds

  try {
    //INcrement the counter and get the new value
    const currentRequests = await redisClient.incr(key);
    //If this is the first request in the window , set the expiry
    if (currentRequests === 1) {
      await redisClient.expire(key, timeWindow);
    }
    if (currentRequests > maxRequest) {
      return res.status(429).json({
        success: false,
        message: `Too many requests , please try ${timeWindow} seconds.`,
      });
    }
    //if not exceeded , proceed
    next();
  } catch (error) {
    console.error("Redis rete limiting error:", error);
    next(new ApiError(500, "Rate limiting service unavailable"));
  }
});
