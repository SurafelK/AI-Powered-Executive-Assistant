import express from 'express'
import { checkCalendar } from '../controller/calendarController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = express.Router()

router.get('/calendar', authMiddleware, checkCalendar);
