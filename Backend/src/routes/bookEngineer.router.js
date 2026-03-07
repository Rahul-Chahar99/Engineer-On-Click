import {Router } from 'express'
import { assignEngineer, bookEngineer, deleteEngineerRequest, getAllEngineerRequests, paymentVerification, showAvailableEngineers} from '../controllers/bookEnginner.controller.js'
import { isAdmin, verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

router.route('/book-engineer').post(bookEngineer)
router.route('/paymentverification').post(paymentVerification)
router.route('/booking-requests',verifyJWT,isAdmin).get(getAllEngineerRequests)
router.route('/booking-requests/:id',verifyJWT,isAdmin).delete(deleteEngineerRequest)
router.route('/available-engineers/:id',verifyJWT,isAdmin).get(showAvailableEngineers)
router.route('/assign-engineer',verifyJWT,isAdmin).patch(assignEngineer )

export default router;