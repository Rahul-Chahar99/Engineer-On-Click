import { Router } from "express";
import { registerUser, logInUser, logOutUser,getUser,refreshAcessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


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
router.route('/current-user').get(verifyJWT,getUser)
router.route('/refresh-token').post(refreshAcessToken)



export default router;
