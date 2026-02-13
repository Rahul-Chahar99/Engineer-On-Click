import { asyncHandler } from "../utils/asyncHandler.js";
// here asyncHandler and ApiError (to handle errors) is used to catch errors in async functions and pass them to the error handling middleware
import { ApiError } from "../utils/ApiError.js";
//here User is user model and uploadOnCloudinary is utility function to upload files to cloudinary
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";
import Contact from "../models/contact.models.js";
import axios from "axios";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found while generating tokens");
    }

    // Fix for legacy data where socialMedia might be stored as an array
    if (user.socialMedia && Array.isArray(user.socialMedia)) {
      user.socialMedia = {
        linkedIn: "",
        twitter: "",
        github: "",
      };
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save the refresh token in the database to allow revocation later
    user.refreshToken = refreshToken;
    // validateBeforeSave: false is used to skip other validation checks (like required fields) since we are only updating the token
    await user.save({ validateBeforeSave: false });
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
    updateFields.avatar = uploadedAvatar.url;
  }

  if (coverImageLocalPath) {
    const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!uploadedCoverImage)
      throw new ApiError(500, "Failed to upload new cover image");
    updateFields.coverImage = uploadedCoverImage.url;
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

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

const getUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
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

//fetching details of all engineers at admin dashboard
const getAllEngineers = asyncHandler(async (req, res) => {
  const engineers = await User.find({ role: "engineer" }).select(
    "-password -refreshToken"
  );
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

const getAiImage = asyncHandler(async (req, res) => {
  
  const { videoUrl } = req.body;
  console.log(videoUrl);
  // 1. Start the actor run and wait for it to finish (waitForFinish=60 seconds)
  const runResponse = await axios.post(
    `https://api.apify.com/v2/acts/pintostudio~youtube-transcript-scraper/runs?token=${process.env.APIFY_API_TOKEN}&waitForFinish=60`,
    { videoUrl }
  );

  // console.log('runReponse the first axios post request', runResponse.data.data.defaultDatasetId);

  if (runResponse.status === 200 || runResponse.status === 201) {
    // 2. Extract the dataset ID from the run object
    const datasetId = runResponse.data.data.defaultDatasetId;

    // 3. Fetch the actual data (transcript) from the dataset
    const datasetResponse = await axios.get(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${process.env.APIFY_API_TOKEN}`
    );

    // console.log("datasetResponse the axios get request" , datasetResponse.data);

    // The Apify dataset returns an array. We extract the first item which contains the transcript 'text'.
    const transcriptData = datasetResponse.data[0];

    if (!transcriptData) {
      throw new ApiError(404, "No transcript data found");
    }
    // console.log("this is the data",transcriptData);

    return res
      .status(200)
      .json(
        new ApiResponse(200, transcriptData, "Transcript fetched successfully")
      );
  } else {
    throw new ApiError(500, "Failed to fetch transcript");
  }
});
const getAiImageWithTranscript = asyncHandler(async(req,res)=>{
  const { Content } = req.body;
  
  
  console.log("Transcript received for image generation");
  console.log("Request Body:", req.body); // Debug: Check what is actually received

   if (!Content) {
    throw new ApiError(400, "Transcript is required");
  }

  if (!process.env.GOOGLE_API_KEY) {
    console.error("GOOGLE_API_KEY is missing in environment variables");
    throw new ApiError(500, "Server configuration error: API Key missing");
  }

  try {
    // 1. Use Google Gemini (via API Key) to generate a creative image prompt from the transcript
    // We use gemini-1.5-flash as it is fast and efficient
    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`;
    
    // Ensure Content is a string and truncate to avoid token limits or payload issues
    const transcriptText = String(Content).substring(0, 12000);

    const promptForGemini = `Based on the following video transcript, create a single, highly detailed, and creative image generation prompt (max 50 words). The prompt should describe a visual scene that captures the essence of the content. Transcript: ${transcriptText}`;

    const geminiResponse = await axios.post(googleApiUrl, {
      contents: [{ parts: [{ text: promptForGemini }] }]
    });

    const generatedPrompt = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedPrompt) {
      console.error("Gemini API response invalid:", JSON.stringify(geminiResponse.data));
      throw new Error("Failed to generate prompt from AI service");
    }
    
    console.log("Gemini Generated Prompt:", generatedPrompt);

    // 2. Generate the image URL using the prompt (using Pollinations for direct image generation)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(generatedPrompt)}`;
    console.log("Final Image URL:", imageUrl);

    return res.status(200).json(new ApiResponse(200, imageUrl, "Image generated successfully"));
  } catch (error) {
    console.error("Error generating image:", error.message);
    if (error.response) {
      console.error("Upstream API Error Data:", JSON.stringify(error.response.data));
    }
    throw new ApiError(500, "Failed to generate image. Please check server logs.");
  }
});


export {
  registerUser,
  logInUser,
  logOutUser,
  getUser,
  getAiImage,
  updateUserProfile,
  refreshAcessToken,
  getAllEngineers,
  getAllContactForms,
  getAllCustomers,
  deleteEngineer,
  deleteCustomer,
  changeCurrentPassword,
  getAiImageWithTranscript
};
