import {Router } from 'express'
import {bookEngineer} from '../controllers/bookEnginner.controller.js'

const router = Router()

router.route('/book-engineer').post(bookEngineer)

export default router;