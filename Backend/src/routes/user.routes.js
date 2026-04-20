import { Router } from "express";
import {
  deleteEngineer,
  deleteCustomer,
  registerUser,
  logInUser,
  logOutUser,
  getUser,
  updateUserProfile,
  refreshAcessToken,
  getAllEngineers,
  getAllCustomers,
  getAllContactForms,
  changeCurrentPassword,
  userStatusToggle,
  getAllBookings,
  rejectOrAcceptBookingRequest,
} from "../controllers/user.controller.js";
import { deleteContactForm } from "../controllers/contact.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllBranches } from "../controllers/admin.controller.js";
import { registerSchema, loginSchema } from "../utils/validateSchema.js";
import { validate } from "../middlewares/validate.middleware.js";
import { rateLimitMiddleware } from "../middlewares/ratelimit.middleware.js";

const router = Router();

// Apply rate limiting to ALL routes in this router centrally (100 requests per 60 seconds)
router.use(rateLimitMiddleware(10, 60));

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  validate(registerSchema),
  registerUser
);
// GET /api/v1/users/bankList?page=1&limit=10
router.route("/bankList").get(verifyJWT, isAdmin,rateLimitMiddleware(5,30), getAllBranches);

router.route("/login").post(validate(loginSchema), logInUser);
router
  .route("/rejectOrAcceptBooking-requests/:id")
  .patch(verifyJWT, rejectOrAcceptBookingRequest);

// secured routes
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/current-user").get(verifyJWT, getUser);
router.route("/refresh-token").post(refreshAcessToken);
router.route("/update-password").post(verifyJWT, changeCurrentPassword);
router.route("/toggle-status/:userId").patch(verifyJWT, userStatusToggle);

//here admin accessing all the engineers
router.route("/engineers").get(verifyJWT, isAdmin, getAllEngineers);

router.route("/bookingRequests/:userId").get(verifyJWT, getAllBookings);

//with this route admin can delete a engineer
router.route("/engineer/:id").delete(verifyJWT, isAdmin, deleteEngineer);

//with this route amdin can access all customers
router.route("/customers").get(verifyJWT, isAdmin, getAllCustomers);
router.route("/customers/:id").delete(verifyJWT, isAdmin, deleteCustomer);

//to get all contact forms - admin only
router.route("/contact-forms").get(verifyJWT, isAdmin, getAllContactForms);
//to delete a contact form - admin only with form id
router
  .route("/contact-forms/:id")
  .delete(verifyJWT, isAdmin, deleteContactForm);

// ROUTE FOR USER TO UPDATE HIS PROFILE
router.route("/update-profile").patch(
  verifyJWT,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  updateUserProfile
);

export default router;
