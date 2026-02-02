import { Router } from "express";
import {deleteEngineer, registerUser, logInUser, logOutUser,getUser,refreshAcessToken ,getAllEngineers,getAllCustomers,getAllContactForms} from "../controllers/user.controller.js";
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
router.route("/logout").post(verifyJWT,isAdmin, logOutUser);
router.route('/current-user').get(verifyJWT,isAdmin,getUser)
router.route('/refresh-token').post(refreshAcessToken)

router.route('/engineers').get(verifyJWT,isAdmin,getAllEngineers)
router.route('/engineer/:id').delete(verifyJWT,isAdmin,deleteEngineer)

router.route('/customers').get(verifyJWT,isAdmin,getAllCustomers)

//to get all contact forms - admin only
router.route('/contact-forms').get(verifyJWT,isAdmin,getAllContactForms)
//to delete a contact form - admin only with form id
router.route('/contact-forms/:id').delete(verifyJWT, isAdmin, deleteContactForm)




export default router;
