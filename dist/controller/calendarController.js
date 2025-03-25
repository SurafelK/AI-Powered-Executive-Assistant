"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCalendars = exports.editCalendars = exports.getCalendars = exports.getTodaysSchedule = exports.checkCalendar = exports.DeleteCalendar = exports.createCalendar = void 0;
const userAccounts_1 = require("../model/userAccounts");
const CalendarManagment_1 = require("../Config/CalendarManagment");
const calendar_1 = require("../model/calendar");
const createCalendar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = req.user.id;
        if (!userId) {
            res.status(400).json({ message: "User ID is not provided" });
            return;
        }
        const { title, endTime, startTime, attendees, description, location, recurrence, reminders, status, timeZone, email } = req.body;
        if (!email || !startTime || !endTime || !attendees || attendees.length === 0) {
            res.status(400).json({ message: "Please provide all required fields" });
            return;
        }
        const Findmail = yield userAccounts_1.UserAccountModel.findOne({ email });
        if (!Findmail) {
            console.log(Findmail);
            res.status(400).json({ message: "Email not found" });
            return;
        }
        if (userId !== Findmail.userId.toString()) {
            res.status(403).json({ message: "This account doesn't belong to you" });
            return;
        }
        const checkCalendar = yield (0, CalendarManagment_1.CheckUserCalendar)(userId, startTime, endTime);
        if (checkCalendar && checkCalendar.calendar && checkCalendar.calendar.length > 0) {
            yield (0, exports.DeleteCalendar)((_a = checkCalendar.calendar) === null || _a === void 0 ? void 0 : _a.map(({ _id }) => _id));
        }
        const newCalendar = new calendar_1.CalendarEventModel({
            title,
            startTime,
            endTime,
            attendees,
            description,
            location,
            recurrence,
            reminders,
            status,
            timeZone,
            userId,
            emailId: Findmail._id
        });
        yield newCalendar.save();
        res.status(201).json({ message: "Event added to calendar successfully", newCalendar });
        return;
    }
    catch (error) {
        console.error("Error creating calendar event:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.createCalendar = createCalendar;
const DeleteCalendar = (calendarId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!calendarId || calendarId.length === 0)
            return;
        const deleteCalendar = yield calendar_1.CalendarEventModel.deleteMany({ _id: { $in: calendarId } });
        console.log(`Deleted ${deleteCalendar.deletedCount} calendar events`);
    }
    catch (error) {
        console.error("Error deleting calendar events:", error);
    }
});
exports.DeleteCalendar = DeleteCalendar;
const checkCalendar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        let { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            res.status(400).json({ message: "StartDate and endDate are required" });
        }
        const FstartDate = new Date(startDate);
        const FendDate = new Date(endDate);
        const { isAvailable, message } = yield (0, CalendarManagment_1.checkUserAvailability)(userId, FstartDate, FendDate);
        res.status(200).json({ isAvailable, message });
    }
    catch (error) {
    }
});
exports.checkCalendar = checkCalendar;
const getTodaysSchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 99));
        const todaysCalendar = yield calendar_1.CalendarEventModel.find({
            userId: userId,
            startTime: { $gte: startOfDay },
            endTime: { $lte: endOfDay }
        });
        res.status(200).json({ message: "Todays schedule", todaysCalendar });
        return;
    }
    catch (error) {
    }
});
exports.getTodaysSchedule = getTodaysSchedule;
const getCalendars = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const userCalenders = yield calendar_1.CalendarEventModel.find({
            userId: userId
        });
        if (!userCalenders || userCalenders.length === 0) {
            res.status(200).json({ message: "You don't have any calendar yet" });
            return;
        }
        res.status(200).json({ message: "retrieved Calendar", userCalenders });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.getCalendars = getCalendars;
const editCalendars = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, startTime, endTime, attendees, description, location, recurrence, reminders, status, timeZone, email } = req.body;
        const calendarId = req.params.id;
        if (!calendarId) {
            res.status(400).json({ message: "Calendar ID is required" });
            return;
        }
        const findCalendar = yield calendar_1.CalendarEventModel.findOne({ userId: req.user.id, _id: calendarId });
        if (!findCalendar) {
            res.status(404).json({ message: "Calendar not found" });
            return;
        }
        const updateCalendar = yield calendar_1.CalendarEventModel.findOneAndUpdate({ _id: calendarId }, { title, startTime, endTime, attendees, description, location, recurrence, reminders, status, timeZone, email }, { new: true });
        if (!updateCalendar) {
            res.status(404).json({ message: "Calendar not found" });
            return;
        }
        res.status(200).json({ message: "Calendar updated successfully", updateCalendar });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.editCalendars = editCalendars;
const deleteCalendars = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const calendarId = req.params.calendarId;
        if (!calendarId) {
            res.status(400).json({ message: "Calendar ID is required" });
            return;
        }
        const userId = req.user.id;
        const findCalendar = yield calendar_1.CalendarEventModel.findOne({ userId, _id: calendarId });
        if (!findCalendar) {
            res.status(404).json({ message: "Calendar not found" });
            return;
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.deleteCalendars = deleteCalendars;
