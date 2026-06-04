import redisClient from "../utils/redisClient.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const rateLimitMiddleware = (
  maxRequest = 10,
  timeWindow = 60,
  prefix = "global"
) => {
  return asyncHandler(async (req, res, next) => {
    // 1. Prioritize User ID for authenticated routes (100% reliable)
    // 2. Fallback to the real client IP via headers (Render/Vercel proxies)
    // 3. Fallback to req.ip for local development
    console.log(req.user?._id.toString());
    const identifier = req.user?._id
      ? req.user?._id?.toString()
      : req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;

    const key = `rate_limit:${prefix}:${identifier}`;
    console.log("Rate Limit Identifier ->>>", identifier);
    log("Rate Limit Key ->>>", key);

    try {
      const currentRequests = await redisClient.incr(key);

      // Ensure the key always has an expiration (to prevent eternal lockouts)
      //   A positive number (e.g., 59, 45, 10): The key exists and has that many seconds remaining before it expires.
      // -1: The key exists, but it has no expiration set (it will stay in the database forever).
      // -2: The key does not exist at all.
      const ttl = await redisClient.ttl(key);
      if (ttl === -1) {
        // -1 means the key exists but has no expiration
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
};
