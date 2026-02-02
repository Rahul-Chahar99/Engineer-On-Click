import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

const connectDb = async () => {
  try {
   // Attempt to connect to MongoDB using the URI from env variables and DB name constant
   const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
   // Log success message with the host to verify which DB instance we are connected to (e.g., local vs Atlas)
   console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);
   
  } catch (error) {
    console.error("Error", error);
    // Exit the process with failure code (1) if DB connection fails, as the app cannot function without it
    process.exit(1)
  }
};


export default connectDb;