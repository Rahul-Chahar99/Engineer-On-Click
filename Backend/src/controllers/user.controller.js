import { asyncHandler } from "../utils/asyncHandler.js";
// here asyncHandler and ApiError (to handle errors) is used to catch errors in async functions and pass them to the error handling middleware
import { ApiError } from "../utils/ApiError.js";
//here User is user model and uploadOnCloudinary is utility function to upload files to cloudinary
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation- not empty
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

  //before sending response remove password and refresh token from user object
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

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully"
      )
    );
});

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// user logout function
const logOutUser = asyncHandler(async (req, res) => {
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
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

export { registerUser, logInUser, logOutUser };
