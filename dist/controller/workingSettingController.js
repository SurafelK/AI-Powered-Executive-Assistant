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
exports.getWorkingHourSettings = exports.SaveWorkingHourSettings = void 0;
const userSetting_1 = require("../model/userSetting");
const SaveWorkingHourSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { ethCalendar, timeSlotDuration, workingDays, workingHoursStart, workingHoursEnd } = req.body;
        if (!userId || !workingDays || !workingHoursStart || !workingHoursEnd || !timeSlotDuration) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const userSettings = yield userSetting_1.UserSettingModel.findOneAndUpdate({ userId }, { workingDays, workingHoursStart, workingHoursEnd, timeSlotDuration, ethCalendar }, { new: true, upsert: true });
        return res.status(200).json({ message: "Working settings saved successfully", data: userSettings });
    }
    catch (error) {
    }
});
exports.SaveWorkingHourSettings = SaveWorkingHourSettings;
const getWorkingHourSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const userSettings = yield userSetting_1.UserSettingModel.findOne({
            userId
        });
        if (!userSettings) {
            res.status(404).json({ message: "User settings not found" });
            return;
        }
        res.status(200).json({ message: "User settings found", data: userSettings });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server error" });
    }
});
exports.getWorkingHourSettings = getWorkingHourSettings;
