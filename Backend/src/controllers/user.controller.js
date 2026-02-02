import { asyncHandler } from "../utils/asyncHandler.js";
// here asyncHandler and ApiError (to handle errors) is used to catch errors in async functions and pass them to the error handling middleware
import { ApiError } from "../utils/ApiError.js";
//here User is user model and uploadOnCloudinary is utility function to upload files to cloudinary
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save the refresh token in the database to allow revocation later
    user.refreshToken = refreshToken;
    // validateBeforeSave: false is used to skip other validation checks (like required fields) since we are only updating the token
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
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

  const { fullName, email, username, password } = req.body;

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
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  //here files coming from multer
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // console.log("Files received:", { avatarLocalPath, coverImageLocalPath });
  // console.log("Full req.files:", req.files);
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload files to Cloudinary (external storage service)
  const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
  // console.log("uploadedAvatar:", uploadedAvatar);

  const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath);
  // console.log("uploadedCoverImage:", uploadedCoverImage);
  if (!uploadedAvatar) {
    throw new ApiError(500, "Failed to upload avatar image");
  }

  const user = await User.create({
    fullName,
    avatar: uploadedAvatar.url,
    coverImage: uploadedCoverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
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

  const user = await User.findOne({ $or: [{ email }, { username }] });

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
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
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

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  };

  // Clear cookies on the client side
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const getUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const refreshAcessToken = asyncHandler(async (req, res) => {
  // Check for refresh token in cookies (preferred) or body
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }
  try {
    // Verify the token signature
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.Refresh_TOKEN_SECRET
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
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
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

export { registerUser, logInUser, logOutUser, getUser, refreshAcessToken };
