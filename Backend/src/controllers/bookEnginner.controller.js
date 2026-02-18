import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
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
      localContact,
      startTime,
      endTime,
    ].some((field) => field === undefined || field === null || (typeof field === "string" && field.trim() === ""))
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const Engineer = await EngineerForm.create({
    customerId,
    startDate,
    endDate,
    branchCode,
    branchName,
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

export { bookEngineer };
