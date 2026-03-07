import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import EngineerForm from "../models/bookEngineer.models.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import Razorpay from "razorpay";
import crypto from "crypto";

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
  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Payment verified successfully"));
});

const getAllEngineerRequests = asyncHandler(async (req, res) => {
  const EngineerRequests = await EngineerForm.find()
    .sort({ _id: -1 })
    .populate("customerId", "fullName email mobileNo");

  if (!EngineerRequests || EngineerRequests.length === 0) {
    throw new ApiError(404, "No engineer requests found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        EngineerRequests,
        "Engineer Requests fetched Successfully"
      )
    );
});
const deleteEngineerRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleteRequest = await EngineerForm.findByIdAndDelete(id);
  if (!deleteRequest) {
    throw new ApiError(404, "Booking Request Form not Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Booking Request Deleted Successfully"));
});

export {
  bookEngineer,
  getAllEngineerRequests,
  deleteEngineerRequest,
  paymentVerification,
};
