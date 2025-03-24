import { Request, Response } from "express";
import { AuthRequest } from "../Config/express";
import { IUserWorkingHourSettingInput } from "../dto/workingHour.dto";
import { UserSettingModel } from "../model/userSetting";

export const SaveWorkingHourSettings = async (req:AuthRequest, res:Response) => {
    try {
        const userId = req.user.id

        const {ethCalendar, timeSlotDuration, workingDays, workingHoursStart, workingHoursEnd} = <IUserWorkingHourSettingInput> req.body

        if (!userId || !workingDays || !workingHoursStart || !workingHoursEnd || !timeSlotDuration) {
            res.status(400).json({ message: "All fields are required" });
            return
        }

        const userSettings = await UserSettingModel.findOneAndUpdate(
            { userId },
            { workingDays, workingHoursStart, workingHoursEnd, timeSlotDuration, ethCalendar },
            { new: true, upsert: true } 
        );

         res.status(200).json({ message: "Working settings saved successfully", data: userSettings });
         return
    } catch (error) {
        res.json(500).json({message:"Internal Server error"})
    }
}

export const getWorkingHourSettings = async (req:AuthRequest, res:Response) => {
    try {
        const userId = req.user.id
        const userSettings = await UserSettingModel.findOne({
            userId
        });

        if (!userSettings) {
            res.status(404).json({ message: "User settings not found" });
            return
        }

        res.status(200).json({ message: "User settings found", data: userSettings });
        return
    } catch (error) {
        res.status(500).json({message:"Internal Server error"})
    }
}