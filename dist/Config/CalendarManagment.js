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
exports.checkScheduleAvailable = exports.CheckUserCalendar = exports.dayNames = exports.checkUserAvailability = void 0;
const userSetting_1 = require("../model/userSetting");
const calendar_1 = require("../model/calendar");
const userAccounts_1 = require("../model/userAccounts");
const checkUserAvailability = (userId, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const checkCalendar = yield (0, exports.CheckUserCalendar)(userId, startDate, endDate);
        const checkSchedule = yield (0, exports.checkScheduleAvailable)(userId, startDate, endDate);
        const userIsAvailable = checkCalendar.isAvailable && checkSchedule.isAvailable ? true : false;
        return { isAvailable: userIsAvailable, message: `${checkCalendar.message} ${checkCalendar.isAvailable === checkSchedule.isAvailable ? "and" : "but"} ${checkSchedule.message} ` };
    }
    catch (error) {
        return { isAvailable: false,
            message: "An error occurred while checking availability." };
    }
});
exports.checkUserAvailability = checkUserAvailability;
const dayNames = (num) => __awaiter(void 0, void 0, void 0, function* () {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[num];
});
exports.dayNames = dayNames;
const CheckUserCalendar = (userId, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        console.log(start);
        console.log(end);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return { isAvailable: false, message: "Invalid date format provided." };
        }
        const userAccounts = yield userAccounts_1.UserAccountModel.find({ userId });
        if (!userAccounts.length) {
            return { isAvailable: true, message: "User account not found." };
        }
        //   const userEmailIds = userAccounts.map(({ _id }) => {
        //     _id
        //   });
        //   console.log(userEmailIds)
        const userCheckCalendar = yield calendar_1.CalendarEventModel.find({
            userId: userId,
            startTime: { $gte: start },
            endTime: { $lte: end },
        });
        if (!userCheckCalendar || userCheckCalendar.length === 0) {
            console.log(userCheckCalendar);
            return {
                isAvailable: true,
                message: `User is available from ${start.toDateString()} to ${end.toDateString()}.`,
            };
        }
        const firstEvent = userCheckCalendar[0];
        const formattedStartDate = (firstEvent === null || firstEvent === void 0 ? void 0 : firstEvent.startTime)
            ? firstEvent.startTime.toLocaleDateString()
            : start.toLocaleDateString();
        const formattedEndDate = (firstEvent === null || firstEvent === void 0 ? void 0 : firstEvent.endTime)
            ? firstEvent.endTime.toLocaleDateString()
            : end.toLocaleDateString();
        const eventTitle = (firstEvent === null || firstEvent === void 0 ? void 0 : firstEvent.title) || "the selected event";
        return {
            isAvailable: false,
            message: `User is busy from ${formattedStartDate} to ${formattedEndDate} for ${eventTitle}.`,
            calendar: userCheckCalendar,
        };
    }
    catch (error) {
        console.error(error);
        return {
            isAvailable: true,
            message: `Error checking calendar between ${startDate} and ${endDate}.`,
        };
    }
});
exports.CheckUserCalendar = CheckUserCalendar;
const checkScheduleAvailable = (userId, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(startDate, endDate);
        const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const userSchedule = yield userSetting_1.UserSettingModel.find({
            userId: userId
        });
        if (!userSchedule || userSchedule.length === 0) {
            const workDate = new Date(startDate);
            const finalDate = new Date(endDate);
            return { isAvailable: false, message: `Not in preffered date on ${dayName[workDate.getDay()]} at ${workDate.getHours()}: ${workDate.getMinutes()} -
                 ${dayName[workDate.getDay()]} - ${finalDate.getHours()}:${finalDate.getMinutes()} ` };
        }
        const userWorkingDays = userSchedule[0].workingDays;
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        const startDay = dayName[startDate.getDay()];
        const endDay = dayName[endDate.getDay()];
        if (!userWorkingDays || !userWorkingDays.includes(startDay) || !userWorkingDays.includes(endDay)) {
            return { isAvailable: false, message: `User preference is not on ${startDay}  - ${endDate}  ` };
        }
        return { isAvailable: true, message: `User preference is ${startDate} ${userWorkingDays.includes(startDay)} - ${endDate}  ${userWorkingDays.includes(endDay)}` };
    }
    catch (error) {
        console.log(error);
        return {
            isAvailable: false,
            message: "An error occurred while checking availability."
        };
    }
});
exports.checkScheduleAvailable = checkScheduleAvailable;
