import "dotenv/config.js";

import { app } from "./app.js";
import connectDb from "./db/index.js";

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;
  await connectDb();
  isConnected = true;
};

// For Vercel serverless
if (process.env.VERCEL) {
  connectToDatabase();
} else {
  // For traditional server (Render, Railway, local)
  connectDb()
    .then(() => {
      app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
      });
    })
    .catch((err) => {
      console.log("mongoDB connection fail", err);
    });
}

export default app;

/*
import express from "express";
const app = express();
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("ERR:", error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`App running on ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error", error);
    throw error;
  }
})();
*/
