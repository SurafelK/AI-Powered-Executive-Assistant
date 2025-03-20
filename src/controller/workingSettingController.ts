import { Request, Response } from "express";
import { AuthRequest } from "../Config/express";
import { IUserWorkingHourSettingInput } from "../dto/workingHour.dto";
import { UserSettingModel } from "../model/userSetting";

export const SaveWorkingHourSettings = async (req:AuthRequest, res:Response) => {
    try {
        const userId = req.user.id

        const {ethCalendar, timeSlotDuration, workingDays, workingHoursStart, workingHoursEnd} = <IUserWorkingHourSettingInput> req.body

        if (!userId || !workingDays || !workingHoursStart || !workingHoursEnd || !timeSlotDuration) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userSettings = await UserSettingModel.findOneAndUpdate(
            { userId },
            { workingDays, workingHoursStart, workingHoursEnd, timeSlotDuration, ethCalendar },
            { new: true, upsert: true } 
        );

        return res.status(200).json({ message: "Working settings saved successfully", data: userSettings });
    } catch (error) {
        
    }
}