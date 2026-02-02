import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import Contact from "../models/contact.models.js";

// Controller to handle contact form submissions
const contactForm = asyncHandler(async (req, res) => {
  // Extract data from request body
  const { email, fullName, message, phoneNumber } = req.body;

  // Validate that all required fields are present and not empty strings
  if (
    [fullName, email, message, phoneNumber].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Create a new contact entry in the database
  const contact = await Contact.create({
    email,
    fullName,
    message,
    phoneNumber,
  });

  // Check if creation was successful
  if (!contact) {
    throw new ApiError(501, "Something went wrong while submitting the form");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, contact, "Form submitted successfully"));
});

export { contactForm };
