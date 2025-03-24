import express from 'express'
import { checkCalendar, createCalendar, deleteCalendars, editCalendars, getCalendars, getTodaysSchedule } from '../controller/calendarController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = express.Router()

router.get('/check', authMiddleware, checkCalendar);
router.get('/all', authMiddleware, getCalendars )
router.get('/today', authMiddleware,  getTodaysSchedule)
router.post('/create', authMiddleware,  createCalendar)
router.put('/update/:calendarId', authMiddleware,  editCalendars)
router.delete('/delete/:calendarId', authMiddleware,  deleteCalendars)
export {router as CalendarRouter}