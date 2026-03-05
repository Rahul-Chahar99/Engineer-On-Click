import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import EngineerForm from "../models/bookEngineer.models.js";
import { ApiResponse } from "../utils/Apiresponse.js";

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
  const totalCostFunction = () => {
    const oneDayInMs = 1000 * 60 * 60 * 24;
    const totalDays =
      Math.round(
        Math.abs((new Date(endDate) - new Date(startDate)) / oneDayInMs)
      ) + 1;
    console.log(`Total days for booking: ${totalDays}`);
    const totalHours = Math.abs(
      parseInt(startTime.split(" ").at(0)) -
        parseInt(endTime.split(" ").at(0))
    );
    if (totalHours < 4) return totalDays * 400;

    return totalDays * totalHours * 100;
  };
  const totalCost = totalCostFunction();

  if (isNaN(totalCost)) {
    throw new ApiError(400, "Invalid date or time format provided");
  }
  console.log(totalCost);
  console.log(typeof totalCost);
  

  const Engineer = await EngineerForm.create({
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
    totalCostOfBooking:totalCost
  });

  if (!Engineer) {
    throw new ApiError(500, "Something went wrong while booking engineer");
  }
  // console.log(Engineer);

  // To calculate the number of days, we find the difference in milliseconds and convert it to days.
  // We add 1 because the period is inclusive of the start and end dates (e.g., booking for just today is 1 day).

  return res
    .status(201)
    .json(new ApiResponse(201, Engineer, "Engineer booked successfully"));
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

export { bookEngineer, getAllEngineerRequests, deleteEngineerRequest };
