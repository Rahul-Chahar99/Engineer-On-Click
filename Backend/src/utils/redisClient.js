import { createClient } from "redis";

const redisClient = createClient({ url: process.env.REDIS_URI });

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () =>
  console.log("Successfully Connected to Redis Cloud")
);

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.log("Could Not Connect to Redis :", error);
  }
};
connectRedis();

export default redisClient;
