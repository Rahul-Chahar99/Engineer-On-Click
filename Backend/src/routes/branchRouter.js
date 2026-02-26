import {Router} from 'express'
import { createBranch,getBranchByCode } from '../controllers/branchData.controller.js'
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/create-branch',verifyJWT,isAdmin).post(createBranch)
router.route('/search',verifyJWT).post(getBranchByCode)

export default router;