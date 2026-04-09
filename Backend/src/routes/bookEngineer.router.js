import {Router } from 'express'
import { assignEngineer, bookEngineer, deleteEngineerRequest, getAllEngineerRequests, paymentVerification, showAvailableEngineers} from '../controllers/bookEnginner.controller.js'
import { isAdmin, verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

router.route('/book-engineer').post(bookEngineer)
router.route('/paymentverification').post(paymentVerification)
router.route('/booking-requests').get(verifyJWT,isAdmin,getAllEngineerRequests)
router.route('/booking-requests/:id').delete(verifyJWT,isAdmin,deleteEngineerRequest)
router.route('/available-engineers/:id').get(verifyJWT,isAdmin,showAvailableEngineers)
router.route('/assign-engineer').patch(assignEngineer )

export default router;