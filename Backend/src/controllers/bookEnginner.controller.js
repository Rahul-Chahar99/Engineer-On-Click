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
  });
  console.log(Engineer);

  if (!Engineer) {
    throw new ApiError(500, "Something went wrong while booking engineer");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, Engineer, "Engineer booked successfully"));
});

const getAllEngineerRequests = asyncHandler(async (req, res) => {
  const EngineerRequests = await EngineerForm.find().populate(
    "customerId",
    "fullName email mobileNo"
  );

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
