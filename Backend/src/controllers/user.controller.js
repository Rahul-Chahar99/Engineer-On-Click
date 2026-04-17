import { asyncHandler } from "../utils/asyncHandler.js";
// here asyncHandler and ApiError (to handle errors) is used to catch errors in async functions and pass them to the error handling middleware
import { ApiError } from "../utils/ApiError.js";
//here User is user model and uploadOnCloudinary is utility function to upload files to cloudinary
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";
import Contact from "../models/contact.models.js";
import * as cloudinary from "cloudinary";
import EngineerForm from "../models/bookEngineer.models.js";
import redisClient from "../utils/redisClient.js";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found while generating tokens");
    }

    if (user.socialMedia && Array.isArray(user.socialMedia)) {
      await User.findByIdAndUpdate(userId, {
        $unset: { socialMedia: "" },
      });
      await User.findByIdAndUpdate(userId, {
        $set: {
          socialMedia: {
            linkedIn: user.socialMedia[0]?.linkedIn || "",
            twitter: user.socialMedia[0]?.twitter || "",
            github: user.socialMedia[0]?.github || "",
          },
        },
      });
    }

    // Refetch user after potential socialMedia fix
    const updatedUser = await User.findById(userId);
    const accessToken = updatedUser.generateAccessToken();
    const refreshToken = updatedUser.generateRefreshToken();

    await User.findByIdAndUpdate(userId, {
      $set: { refreshToken },
    });

    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      500,
      error?.message ||
        "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation- not empty {username or email}
  //check if user already exists:email,username
  //check for images,check for avatar
  //upload images,avatar to cloudinary
  //create user object - create entry in db
  //remove password and refresh token field from response
  //check for userCreation
  //return response else send error
  //hashpassword,

  const { fullName, email, username, password, role } = req.body;

  // console.log("Register Request Body:", req.body);
  // console.log("Fields:", { fullName, email, username, password });

  // Check which fields are missing
  // const missingFields = [];
  // if (!fullName || fullName.trim() === "") missingFields.push("fullName");
  // if (!email || email.trim() === "") missingFields.push("email");
  // if (!username || username.trim() === "") missingFields.push("username");
  // if (!password || password.trim() === "") missingFields.push("password");

  // if (missingFields.length > 0) {
  //   throw new ApiError(400, `Missing required fields: ${missingFields.join(", ")}`);
  // }
  // if (
  //   [fullName, email, username, password].some(
  //     (field) => !field || field?.trim() === ""
  //   )
  // ) {
  //   throw new ApiError(400, "All fields are required");
  // }

  const existedUser = await User.findOne({
    $or: [
      { username: username.toLowerCase().trim() },
      { email: email.toLowerCase().trim() },
    ],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  //here files coming from multer
  // const avatarLocalPath = req.files?.avatar?.[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // console.log("Files received:", { avatarLocalPath, coverImageLocalPath });
  // console.log("Full req.files:", req.files);

  // Upload files to Cloudinary (external storage service)
  // const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
  // // console.log("uploadedAvatar:", uploadedAvatar);

  // const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath);
  // console.log("uploadedCoverImage:", uploadedCoverImage);

  const user = await User.create({
    fullName,
    // avatar: uploadedAvatar?.secure_url || "",
    // coverImage: uploadedCoverImage?.secure_url || "",
    email: email.toLowerCase().trim(),
    password,
    username: username.toLowerCase().trim(),
    role: role || "customer",
  });
  // console.log(uploadedAvatar, uploadedCoverImage);

  // Fetch the created user again without sensitive fields (password, refreshToken) to send back to the client
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  console.log("Created User (without sensitive fields):", createdUser);
  if (!createdUser)
    throw new ApiError(500, "something went wrong while registering user");

  // Invalidate Redis cache so the new engineer appears immediately in the Admin Dashboard
  if (createdUser.role === "engineer") {
    try {
      const keys = await redisClient.keys("get_all_engineers*");
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error("Redis cache deletion error: ", error);
    }
  }
  if (createdUser.role === "customer") {
    try {
      await redisClient.del("get_all_customers");
    } catch (error) {
      console.error("Redis cache deletion error: ", error);
    }
  }

  //here we are sending 201 status for resource creation and created user object to front end
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

//from here login function starts
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const logInUser = asyncHandler(async (req, res) => {
  // get user details from front end - req.body
  //check if we got username or email
  //find the user based on username or email
  //if user exist do the password check
  //generate accessToken and refreshToken
  //find user and remove password and refresh token
  //at the end send the refresh token and access token using cookies and rest of user details
  const { email, password, username } = req.body;

  const user = await User.findOne({
    $or: [
      { email: email?.trim()?.toLowerCase() },
      { username: username?.trim()?.toLowerCase() },
    ],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // const accessToken = user.generateAccessToken();
  // const refreshToken = user.generateRefreshToken();

  // user.refreshToken = refreshToken;
  // await user.save({ validateBeforeSave: false });
  // Generate new tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Cookie options for security:
  // httpOnly: true -> prevents client-side JS from reading the cookie (XSS protection)
  // secure: true -> only sends cookie over HTTPS (in production)
  // sameSite: "none" -> allows cross-site cookies (required for Vercel + Render)
  // path: "/" -> cookie available for entire domain
  // 🔧 LOCAL vs PRODUCTION: Automatically adapts based on NODE_ENV
  const isProduction = process.env.NODE_ENV === "production";
  const options = {
    httpOnly: true,
    secure: isProduction, // true in production, false locally
    sameSite: isProduction ? "none" : "lax", // "none" for cross-site (production), "lax" for same-site (local)
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // Set Access Token cookie
    .cookie("refreshToken", refreshToken, options) // Set Refresh Token cookie
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
        },
        "User logged in Successfully"
      )
    );
});

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// user logout function
const logOutUser = asyncHandler(async (req, res) => {
  // Remove the refresh token from the database (server-side logout)
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  // 🔧 LOCAL vs PRODUCTION: Automatically adapts based on NODE_ENV
  const isProduction = process.env.NODE_ENV === "production";
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };

  // Clear cookies on the client side
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const { fullName, email, mobileNo, aadharNo, address, jobTitle, pincode } =
    req.body;
  // socialMedia comes as an object from req.body when sent via FormData
  const socialMedia = req.body.socialMedia || {};

  const userId = req.user._id;

  const updateFields = {
    fullName,
    email,
    mobileNo,
    aadharNo,
    address,
    jobTitle,
    pincode,
    socialMedia,
  };

  // Handle file uploads
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (avatarLocalPath) {
    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
    if (!uploadedAvatar) throw new ApiError(500, "Failed to upload new avatar");
    updateFields.avatar = uploadedAvatar.secure_url;
  }

  if (coverImageLocalPath) {
    const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!uploadedCoverImage)
      throw new ApiError(500, "Failed to upload new cover image");
    updateFields.coverImage = uploadedCoverImage.secure_url;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        ...updateFields,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  // crate a utility function after uploading new avatar or cover image the old image should delete from cloudinary
  if (avatarLocalPath) {
    const oldAvatarUrl = req.user.avatar;
    if (oldAvatarUrl) {
      // Extract public_id from the old avatar URL (assuming it's a Cloudinary URL)
      const oldAvatarPublicId = oldAvatarUrl.split("/").pop().split(".")[0];
      // Delete the old avatar from Cloudinary
      await cloudinary.uploader.destroy(oldAvatarPublicId);
      // console.log("file delete ", oldAvatarPublicId);
    }
  }
  if (coverImageLocalPath) {
    const oldCoverImageUrl = req.user.coverImage;
    if (oldCoverImageUrl) {
      const oldCoverImagePublicId = oldCoverImageUrl
        .split("/")
        .pop()
        .split(".")[0];
      await cloudinary.uploader.destroy(oldCoverImagePublicId);
    }
  }

  if (user.role === "engineer") {
    try {
      const keys = await redisClient.keys("get_all_engineers*");
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error("Redis cache deletion error: ", error);
    }
  }
  if (user.role === "customer") {
    try {
      await redisClient.del("get_all_customers");
    } catch (error) {
      console.error("Redis cache deletion error: ", error);
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

const getUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const userStatusToggle = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.is_active = !user.is_active;
  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(userId).select(
    "-password -refreshToken"
  );

  if (updatedUser.role === "engineer") {
    try {
      const keys = await redisClient.keys("get_all_engineers*");
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error("Redis cache deletion error: ", error);
    }
  }

  if (updatedUser.role === "customer") {
    try {
      await redisClient.del("get_all_customers");
    } catch (error) {
      console.error("Redis cache deletion error: ", error);
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User status updated successfully")
    );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const user = await User.findById(req.user?.id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) throw new ApiError(401, "Invalid Password");

  if (newPassword !== confirmPassword)
    throw new ApiError(401, "Enter Same Password");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password Changed Successfully"));
});

const refreshAcessToken = asyncHandler(async (req, res) => {
  // Check for refresh token in cookies (preferred) or body
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }
  try {
    // Verify the token signature
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    // Security Check: Ensure the token provided matches the one stored in the DB
    // If they don't match, the token might have been reused or the user logged out elsewhere
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired");
    }
    // 🔧 LOCAL vs PRODUCTION: Automatically adapts based on NODE_ENV
    const isProduction = process.env.NODE_ENV === "production";
    const options = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    // Generate NEW tokens (Rotation)
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          201,
          { accessToken, newRefreshToken },
          "session restored"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

//fetching details of all engineers at admin dashboard
const getAllEngineers = asyncHandler(
  async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search ? req.query.search.trim() : "";

    // Cache key must be unique to the specific page, limit, and search parameters
    const cacheKey = `get_all_engineers_page_${page}_limit_${limit}_search_${searchQuery.toLowerCase()}`;

    try {
      let responseData = null;
      let source = "";

      // 1. Try to fetch data from Redis
      try {
        const cacheData = await redisClient.get(cacheKey);
        if (cacheData) {
          console.log("serving all engineers list from redis");
          responseData = JSON.parse(cacheData);
          source = "Redis";
        }
      } catch (error) {
        console.error("Redis fetch error (Engineers): ", error);
      }

      // 2. Fallback to MongoDB if Redis failed, was empty, or returned corrupted data
      if (!responseData) {
        console.log("serving all engineers list from mongo db");

        // Build the database query object
        const query = { role: "engineer" };

        // If there's a search, use regex for partial, case-insensitive matches in DB
        /*If the user typed something into a search bar (stored in the searchQuery variable), this block modifies the database query to look for that text.

        $or: Tells the database that a record is a match if the search term is found in any of the listed fields (Full Name OR Mobile Number OR Pincode).

        $regex: Uses regular expressions to allow for partial matches. If the user searches "Smit", it will successfully find "Smith".

        $options: "i": Makes the search case-insensitive. Searching for "john" will match "John", "JOHN", or "jOhN".*/
        if (searchQuery) {
          query.$or = [
            { fullName: { $regex: searchQuery, $options: "i" } },
            { mobileNo: { $regex: searchQuery, $options: "i" } },
            { pincode: { $regex: searchQuery, $options: "i" } },
          ];
        }

        // Determine the total matching records so frontend knows total pages
        const totalRecords = await User.countDocuments(query);

        // Fetch paginated documents using skip and limit
        const skip = (page - 1) * limit;
        const engineers = await User.find(query)
          .sort({ _id: -1 })
          .skip(skip)
          .limit(limit)
          .select("-password -refreshToken")
          .lean();

        responseData = {
          data: engineers,
          currentPage: page,
          totalPages: Math.ceil(totalRecords / limit),
          totalRecords: totalRecords,
        };

        source = "MongoDB";
        try {
          await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));
        } catch (error) {
          console.error("Redis cache set error (Engineers): ", error);
        }
      }

      responseData.source = source;

      // 5. Send Response
      return res
        .status(200)
        .json(new ApiResponse(200, responseData, "Data fetched successfully"));
    } catch (error) {
      throw new ApiError(500, "internal server error");
    }
  }
  //    {
  //   const engineers = await User.find({ role: "engineer" })
  //     .sort({ _id: -1 })
  //     .select("-password -refreshToken");
  //   if (!engineers || engineers.length === 0) {
  //     throw new ApiError(404, "No engineers found");
  //   }
  //   return res
  //     .status(200)
  //     .json(new ApiResponse(200, engineers, "Engineers fetched successfully"));
  // }
);

//fetching of all contact forms at admin page
const getAllContactForms = asyncHandler(async (req, res) => {
  const allForms = await Contact.find({}).sort({ _id: -1 });
  if (!allForms || allForms.length === 0) {
    throw new ApiError(404, "No contact forms found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, allForms, "Contact forms fetched successfully"));
});

//all Customers fetching at admin dashboard
const getAllCustomers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const searchQuery = req.query.search ? req.query.search.trim() : "";
  const cacheKey = `get_all_customers_page=${page}_limit=${limit}_searchQuery=${searchQuery.toLowerCase()}`;
  let responseData = null;
  let source = "";

  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("Serving allCustomersList from Redis");
      source = "Redis";
      responseData = JSON.parse(cachedData);
    }
  } catch (error) {
    console.error("Redis fetch error (Customers): ", error);
  }

  if (!responseData) {
    console.log("Serving allCustomersList from MongoDB");

    const query = { role: "customer" };

    if (searchQuery) {
      query.$or = [{ email: { $regex: searchQuery, $options: "i" } }];
    }

    const totalRecords = await User.countDocuments(query);
    const skip = (page - 1) * limit;
    const allCustomersList = await User.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ _id: -1 })
      .select("-password -refreshToken")
      .lean();
    // console.log(allCustomersList);
    responseData = {
      data: allCustomersList,
      totalPages: Math.ceil(allCustomersList.length / limit),
      totalRecords: totalRecords,
      currentPage: page,
    };
    source = "MongoDB";
    try {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));
    } catch (error) {
      console.error("Redis cache set error (Customers): ", error);
    }
  }
  responseData.source = source;

  return res
    .status(200)
    .json(
      new ApiResponse(200, responseData, "All customer fetched sucessfully")
    );
  // const allCustomersList = await User.find({ role: "customer" })
  //   .sort({ _id: -1 })
  //   .select("-password -refreshToken");
  // if (!allCustomersList || allCustomersList.length === 0) {
  //   throw new ApiError(404, "No allCustomersList found");
  // }

  // return res
  //   .status(200)
  //   .json(new ApiResponse(200, allCustomersList, "Customers fetched successfully"));
});

//             engineer by id - admin only
const deleteEngineer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const engineer = await User.findByIdAndDelete(id);
  if (!engineer) {
    throw new ApiError(404, "Enginner Not Found");
  }
  try {
    const keys = await redisClient.keys("get_all_engineers*");
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error("Redis cache deletion error: ", error);
  }

  console.log(`Deleted Engineer : ${engineer}`);

  return res
    .status(200)
    .json(new ApiResponse(200, engineer, "Enginner deleted SuccessFully "));
});
const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await User.findByIdAndDelete(id);
  if (!customer) {
    throw new ApiError(404, "Enginner Not Found");
  }
  try {
    const keys = await redisClient.keys("get_all_customers*");
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error("Redis cache deletion error: ", error);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, customer, "Customer Deleted SuccessFully"));
});

const getAllBookings = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const searchQuery = req.query.search ? req.query.search.trim() : "";
  const cacheKey = `all_bookings_engineer_${userId}_page_${page}_limit_${limit}_search_${searchQuery.toLowerCase()}`;

  let source = "";
  let responseData = null;

  // 1. Try Redis
  try {
    const cacheData = await redisClient.get(cacheKey);
    if (cacheData) {
      console.log("serving booking request from redis");
      responseData = JSON.parse(cacheData);
      source = "Redis";
    }
  } catch (error) {
    console.error("Redis Fetch Error (Bookings):", error);
  }

  // 2. Fallback to MongoDB
  if (!responseData) {
    console.log("serving all booking request from MongoDB");
    const query = {
      assignedEngineerId: new mongoose.Types.ObjectId(userId),
      engineerAssign: { $ne: "Rejected_By_Engineer" },
    };

    if (searchQuery) {
      query.$or = [
        { branchName: { $regex: searchQuery, $options: "i" } },
        { branchCode: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const totalRecords = await EngineerForm.countDocuments(query);
    const skip = (page - 1) * limit;

    const bookings = await EngineerForm.find(query)
      .populate("customerId", "fullName email mobileNo")
      .populate("branchId", "branchLocationGoogleLink")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    console.log(bookings);

    responseData = {
      data: bookings,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
    };
    source = "MongoDB";

    try {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));
    } catch (error) {
      console.error("Redis cache set error (Bookings):", error);
    }
  }

  responseData.source = source;
  return res
    .status(200)
    .json(
      new ApiResponse(200, responseData, "Booking Details fetched successfully")
    );
});

//To delete a engineer booking request
const rejectOrAcceptBookingRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log("id--->>>",id);
  console.log('status--->>>',status)
  

  const updatedRequest = await EngineerForm.findByIdAndUpdate(
    id,
    {
      $set: {
        engineerAssign:
          status === "rejected" ? "Rejected_By_Engineer" : "Accepted",
      },
    },
    { new: true }
  );
  if (!updatedRequest) {
    throw new ApiError(404, "Booking Request Form not Found");
  }
  try {
    const keys = await redisClient.keys(
      `all_bookings_engineer_${updatedRequest.assignedEngineerId}*`
    );
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error("Redis Cache Deletion Error (Bookings): ", error);
  }
  const message =
    status === "rejected"
      ? "Booking Request Rejected Successfully"
      : "Booking Request Accepted Successfully";
  return res.status(200).json(new ApiResponse(200, updatedRequest, message));
});

export {
  registerUser,
  logInUser,
  logOutUser,
  getUser,
  updateUserProfile,
  refreshAcessToken,
  getAllEngineers,
  getAllContactForms,
  getAllCustomers,
  deleteEngineer,
  deleteCustomer,
  changeCurrentPassword,
  userStatusToggle,
  getAllBookings,
  rejectOrAcceptBookingRequest,
};
