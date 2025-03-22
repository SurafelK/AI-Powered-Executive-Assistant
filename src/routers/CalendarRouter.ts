import express from 'express'
import { checkCalendar, createCalendar, getCalendars, getTodaysSchedule } from '../controller/calendarController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = express.Router()

router.get('/check', authMiddleware, checkCalendar);
router.get('/all', authMiddleware, getCalendars )
router.get('/today', authMiddleware,  getTodaysSchedule)
router.post('/create', authMiddleware,  createCalendar)

export {router as CalendarRouter}