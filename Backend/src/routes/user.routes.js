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
} from "../controllers/user.controller.js";
import { deleteContactForm } from "../controllers/contact.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

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
  registerUser
);

router.route("/login").post(logInUser);

// secured routes
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/current-user").get(verifyJWT, getUser);
router.route("/refresh-token").post(refreshAcessToken);

//here admin accessing all the engineers
router.route("/engineers").get(verifyJWT, isAdmin, getAllEngineers);

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
router.route("/update-profile").put(
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
