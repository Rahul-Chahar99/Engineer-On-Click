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
  if (
    [fullName, email, username, password].some(
      (field) => !field || field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

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

  if (!createdUser)
    throw new ApiError(500, "something went wrong while registering user");

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

  if (!email && !username) {
    throw new ApiError(400, "email or username is required");
  }

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
  const { fullName, email, mobileNo, aadharNo, address, jobTitle } = req.body;
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
const getAllEngineers = asyncHandler(async (req, res) => {
  const engineers = await User.find({ role: "engineer" })
    .sort({ _id: -1 })
    .select("-password -refreshToken");
  if (!engineers || engineers.length === 0) {
    throw new ApiError(404, "No engineers found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, engineers, "Engineers fetched successfully"));
});

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
  const customers = await User.find({ role: "customer" })
    .sort({ _id: -1 })
    .select("-password -refreshToken");
  if (!customers || customers.length === 0) {
    throw new ApiError(404, "No customers found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, customers, "Customers fetched successfully"));
});

//             engineer by id - admin only
const deleteEngineer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const engineer = await User.findByIdAndDelete(id);
  if (!engineer) {
    throw new ApiError(404, "Enginner Not Found");
  }
  console.log(`Deleted Engineer : ${engineer}`);

  return res
    .status(200)
    .json(new ApiResponse(200, engineer, "Enginner deleted SuccessFully "));
});
const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await User.findByIdAndDelete(id);
  if (!customer) throw new ApiError(404, "Customer Not Found");

  return res
    .status(200)
    .json(new ApiResponse(200, customer, "Customer Deleted SuccessFully"));
});

const getAllBookings = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const bookings = await EngineerForm.find({
    assignedEngineerId: userId,
    engineerAssign: { $ne: "Rejected_By_Engineer" },
  })
    .populate("customerId", "fullName email localContact ")
    .populate("branchId", "branchLocationGoogleLink")
    .sort({ createdAt: -1 });
  if (!bookings || bookings.length === 0)
    throw new ApiError(404, "No Bookings found for this engineer");

  return res
    .status(200)
    .json(
      new ApiResponse(200, bookings, "Booking Details fetched successfully")
    );
});
//To delete a engineer booking request
const rejectBookingRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedRequest = await EngineerForm.findByIdAndUpdate(
    id,
    {
      $set: { engineerAssign: "Rejected_By_Engineer" },
    },
    { new: true }
  );
  if (!updatedRequest) {
    throw new ApiError(404, "Booking Request Form not Found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedRequest,
        "Booking Request Rejected Successfully"
      )
    );
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
  rejectBookingRequest,
};
