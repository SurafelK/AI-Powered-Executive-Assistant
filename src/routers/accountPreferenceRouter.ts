import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { getWorkingHourSettings, SaveWorkingHourSettings } from '../controller/workingSettingController'
const router = express.Router()

router.post ('/add', authMiddleware, SaveWorkingHourSettings)
router.get ('/get', authMiddleware, getWorkingHourSettings)

export { router as WorkingSettingRouter }
