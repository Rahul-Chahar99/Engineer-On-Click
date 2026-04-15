import {Router} from 'express'
import { createBranch,getBranchByCode } from '../controllers/branchData.controller.js'
import { isAdmin, isCoustomer, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/create-branch').post(verifyJWT,isAdmin,createBranch)
router.route('/search').post(verifyJWT,getBranchByCode)

export default router;