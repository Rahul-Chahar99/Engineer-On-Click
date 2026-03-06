import {Router } from 'express'
import {bookEngineer, deleteEngineerRequest, getAllEngineerRequests, paymentVerification} from '../controllers/bookEnginner.controller.js'
import { isAdmin, verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

router.route('/book-engineer').post(bookEngineer)
router.route('/paymentverification').post(paymentVerification)
router.route('/booking-requests',verifyJWT,isAdmin).get(getAllEngineerRequests)
router.route('/booking-requests/:id',verifyJWT,isAdmin).delete(deleteEngineerRequest)

export default router;