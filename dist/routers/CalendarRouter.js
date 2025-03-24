"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarRouter = void 0;
const express_1 = __importDefault(require("express"));
const calendarController_1 = require("../controller/calendarController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
exports.CalendarRouter = router;
router.get('/check', authMiddleware_1.authMiddleware, calendarController_1.checkCalendar);
router.get('/all', authMiddleware_1.authMiddleware, calendarController_1.getCalendars);
router.get('/today', authMiddleware_1.authMiddleware, calendarController_1.getTodaysSchedule);
router.post('/create', authMiddleware_1.authMiddleware, calendarController_1.createCalendar);
router.put('/update/:calendarId', authMiddleware_1.authMiddleware, calendarController_1.editCalendars);
router.delete('/delete/:calendarId', authMiddleware_1.authMiddleware, calendarController_1.deleteCalendars);
