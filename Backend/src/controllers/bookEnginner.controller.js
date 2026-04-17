import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import EngineerForm from "../models/bookEngineer.models.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { User } from "../models/user.models.js";
import { BranchData } from "../models/branchData.model.js";
import redisClient from "../utils/redisClient.js";

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const bookEngineer = asyncHandler(async (req, res) => {
  const {
    customerId,
    startDate,
    endDate,
    branchCode,
    branchName,
    branchAddress,
    pincode,
    city,
    localContact,
    startTime,
    endTime,
  } = req.body;

  if (
    [
      customerId,
      startDate,
      endDate,
      branchCode,
      branchName,
      branchAddress,
      pincode,
      city,
      localContact,
      startTime,
      endTime,
    ].some(
      (field) =>
        field === undefined ||
        field === null ||
        (typeof field === "string" && field.trim() === "")
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //function to calculate total cost of booking
  // To calculate the number of days, we find the difference in milliseconds and convert it to days.
  // We add 1 because the period is inclusive of the start and end dates (e.g., booking for just today is 1 day).
  const totalCostFunction = () => {
    const oneDayInMs = 1000 * 60 * 60 * 24;
    const totalDays =
      Math.round(
        Math.abs((new Date(endDate) - new Date(startDate)) / oneDayInMs)
      ) + 1;
    console.log(`Total days for booking: ${totalDays}`);

    // Helper to parse "10:00 AM" to hours (float)
    const parseTime = (timeStr) => {
      if (!timeStr) return 0;
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":");
      hours = parseInt(hours, 10);
      if (hours === 12) {
        hours = modifier === "PM" ? 12 : 0;
      } else if (modifier === "PM") {
        hours += 12;
      }
      return hours + parseInt(minutes || "0", 10) / 60;
    };

    const totalHours = Math.abs(parseTime(endTime) - parseTime(startTime));

    if (totalHours < 4) return totalDays * 400;

    return totalDays * totalHours * 100;
  };
  const totalCost = totalCostFunction();

  if (isNaN(totalCost)) {
    throw new ApiError(400, "Invalid date or time format provided");
  }
  // console.log(totalCost);
  // console.log(typeof totalCost);
  const options = {
    amount: Math.ceil(totalCost * 100), // Amount in paise (1 INR = 100 paise)
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  const order = await instance.orders.create(options);

  if (!order) throw new ApiError(500, "Error creating Razorpay order");

  // Save booking with Pending status
  const engineerBooking = await EngineerForm.create({
    customerId,
    startDate,
    endDate,
    branchCode,
    branchName,
    pincode,
    city,
    address: branchAddress,
    localContact,
    startTime,
    endTime,
    totalCostOfBooking: totalCost,
    orderId: order.id,
    paymentStatus: "Pending",
  });

  if (!engineerBooking) {
    throw new ApiError(500, "Something went wrong while booking engineer");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { order, key: process.env.RAZORPAY_KEY_ID },
        "Razorpay order created successfully"
      )
    );
});

const paymentVerification = asyncHandler(async (req, res) => {
  console.log("paymentVerification payload", req.body);
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const body = razorpayOrderId + "|" + razorpayPaymentId;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpaySignature;

  if (!isAuthentic) {
    console.error("razorpay signature mismatch", {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      expectedSignature,
    });
    throw new ApiError(400, "Invalid Payment Signature");
  }

  // Update booking status to Completed
  const booking = await EngineerForm.findOneAndUpdate(
    { orderId: razorpayOrderId },
    {
      $set: {
        paymentId: razorpayPaymentId,
        paymentStatus: "Completed",
      },
    },
    { new: true }
  );
  console.log("Updated booking after payment verification", booking);

  // Notify admin via WebSocket about the newly created booking
  const io = req.app.get("io");
  if (io) {
    io.to("admin_room").emit("new_booking_notification", {
      message: "A new booking has been successfully paid and created.",
      bookingDetails: booking,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Payment verified successfully"));
});

const getAllEngineerRequests = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const searchQuery = req.query.search ? req.query.search.trim() : "";
  const cacheKey = `all_engineer_requests_page_${page}_limit_${limit}_search_${searchQuery.toLowerCase()}`;
  let responseData = null;
  let source = "";
  try {
    const cacheData = await redisClient.get(cacheKey);
    if (cacheData) {
      console.log("serving all Booking request from redis");
      responseData = JSON.parse(cacheData);
      source = "redis";
    }
  } catch (error) {
    console.error("Reids fetch error (Booking Reuest): ", error);
  }

  //fallback to mongodb if redis failed , was empty or return corrupted data
  if (!responseData) {
    console.log("Serving all Booking requests from MongoDB");
    const query = {};
    if (searchQuery) {
      query.$or = [
        { branchCode: { $regex: searchQuery, $options: "i" } },
        { fullName: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const totalRecords = await EngineerForm.countDocuments(query);
    const skip = (page - 1) * limit;
    const bookings = await EngineerForm.find(query)
      .populate("customerId", "fullName email mobileNo")
      .populate("branchId", "branchCode branchLocationGoogleLink branchName")
      .populate("assignedEngineerId", "email fullName")
      .sort({ _id: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
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
      console.error("Redis cache set error (Bookings) :", error);
    }
  }
  responseData.source = source;
  return res
    .status(200)
    .json(new ApiResponse(200, responseData, "Data Fetched Successfully"));
});
//Hello Sir, I Saw the B1 role opening and wanted to express interest. Even though I'm WASE band-4th year scholar,I have been preparing stronly for such roles and would appreciate a chance to interview and be considered for the position. Thank you for your time and consideration.
//To delete a engineer booking request
const deleteEngineerRequest = asyncHandler(async (req, res) => {
  
  const { id } = req.params;
  const deleteRequest = await EngineerForm.findByIdAndDelete(id);
  if (!deleteRequest) {
    throw new ApiError(404, "Booking Request Form not Found");
  }


  // Unset the bookingId from the assigned engineer
  if (deleteRequest.assignedEngineerId) {
    await User.findByIdAndUpdate(deleteRequest.assignedEngineerId, {
      $unset: { bookingId: 1 },
    });
  }

  try {
    const keys = await redisClient.keys(`all_engineer_requests*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    // Clear the cache for the assigned engineer's booking requests
    if (deleteRequest.assignedEngineerId) {
      const engineerIdStr = deleteRequest.assignedEngineerId.toString();
      const engineerKeys = await redisClient.keys(`all_bookings_engineer_${engineerIdStr}*`);
      if (engineerKeys.length > 0) {
        await redisClient.del(engineerKeys);
      }
    }
    // Invalidate cache for the first page with default limit and no search
  } catch (error) {
    console.error("Redis cache deletion error (Booking Requests) :", error);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Booking Request Deleted Successfully"));
});

//to show all available engineer where their status is_active status is true
const showAvailableEngineers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Using findOne because we are searching by the custom 'orderId' field.
  // If 'id' refers to the MongoDB _id, use EngineerForm.findById(id) instead.
  const bookingDetails = await EngineerForm.findOne({ orderId: id }).select(
    "pincode city"
  );
  console.log("booking details --->>> ", bookingDetails);
  if (!bookingDetails) throw new ApiError(404, "Data Not Found");
  // Mock logic to assign an engineer based on pincode and city
  const availabeEngineers = await User.find({
    role: "engineer",
    is_active: true,
    pincode: bookingDetails.pincode,
  }).select("fullName");
  if (!availabeEngineers) throw new ApiError(404, "Data Not Found");
  console.log(availabeEngineers);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        availabeEngineers,
        "Available Engineers Fetched Successfully"
      )
    );
});

//to assign engineer to a particular booking request
const assignEngineer = asyncHandler(async (req, res) => {
  const { orderId, engineerId } = req.body;

  if (!orderId || !engineerId) {
    throw new ApiError(400, "Order ID and Engineer ID are required");
  }

  const engineer = await User.findById(engineerId);
  if (!engineer) {
    throw new ApiError(404, "Engineer not found");
  }

  // 1. Find existing booking first to get the branchCode
  const existingBooking = await EngineerForm.findOne({ orderId: orderId });
  if (!existingBooking) throw new ApiError(404, "Booking not found");

  // 2. Fetch branch details using that branchCode
  const branchData = await BranchData.findOne({
    branchCode: existingBooking.branchCode,
  });

  // 3. Perform a SINGLE update for both Engineer and Branch ID
  const updatedBooking = await EngineerForm.findOneAndUpdate(
    { orderId: orderId },
    {
      $set: {
        engineerAssign: "Assigned",
        assignedEngineerId: engineer._id,
        branchId: branchData ? branchData._id : undefined,
      },
    },
    { new: true }
  );
  try {
    const adminKeys = await redisClient.keys(`all_engineer_requests*`);
    if (adminKeys.length > 0) {
      await Promise.all(adminKeys.map((key) => redisClient.del(key)));
    }
  } catch (error) {
    console.error("Redis cache deletion error (Admin):", error);
  }

  try {
    const engineerKeys = await redisClient.keys(`all_bookings_engineer_${engineer._id.toString()}*`);
    if (engineerKeys.length > 0) {
      await Promise.all(engineerKeys.map((key) => redisClient.del(key)));
    }
  } catch (error) {
    console.error("Redis cache deletion error (Engineer):", error);
  }

  await User.findByIdAndUpdate(engineer._id, {
    $set: { bookingId: updatedBooking._id },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedBooking, "Engineer Assigned Successfully")
    );
});

export {
  bookEngineer,
  getAllEngineerRequests,
  deleteEngineerRequest,
  paymentVerification,
  showAvailableEngineers,
  assignEngineer,
};
