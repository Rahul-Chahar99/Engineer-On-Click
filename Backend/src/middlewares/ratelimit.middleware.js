import redisClient from "../utils/redisClient.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const rateLimitMiddleware = asyncHandler(async (req, res, next) => {
  // 1. Prioritize User ID for authenticated routes (100% reliable)
  // 2. Fallback to the real client IP via headers (Render/Vercel proxies)
  // 3. Fallback to req.ip for local development
  const identifier = req.user?._id
    ? req.user._id.toString()
    : req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;

  const key = `rate_limit:${identifier}`;
  console.log("Rate Limit Identifier ->>>", identifier);
 

  const maxRequest = 5;
  const timeWindow = 60; //seconds

  try {
    //Increment the counter and get the new value
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
    console.error("Redis rate limiting error:", error);
    next(new ApiError(500, "Rate limiting service unavailable"));
  }
});
