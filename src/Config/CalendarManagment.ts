import { startOfDay } from 'date-fns';
import { UserSettingModel } from "../model/userSetting";
import { CalendarEventModel } from '../model/calendar';

export const CheckUserCalendar = async (userId:string, startDate: Date, endDate:Date): Promise<{ isAvailable: boolean; message: string }  > => {
    try {
        const userCheckCalendar = await CalendarEventModel.find({
            userId:userId
        })

        if(!userCheckCalendar){
           return {isAvailable:true, message:`Calendar is free at ${startDate} - ${endDate}` }
        }

        // const calendar = userCheckCalendar.

        return {isAvailable:true, message:`Available on ${startDate} - ${endDate}` }
    } catch (error) {
        return {isAvailable:true, message:`Available on ${startDate} - ${endDate}` }
    }
}

export const checkScheduleAvailable = async (userId:string, startDate: Date, endDate:Date): Promise<{ isAvailable: boolean; message: string }  > => {
    try {
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      
        const userSchedule = await UserSettingModel.find({
            userId: userId
        })
        if(!userSchedule){
            message: "You don't have working schedule"
        }
        const userWorkingDays = userSchedule[0].workingDays

        startDate = new Date(startDate);
        endDate = new Date(endDate);

        const startDay = dayNames[startDate.getDay()];
        const endDay = dayNames[endDate.getDay()];

        if (!userWorkingDays || !userWorkingDays.includes(startDay) || !userWorkingDays.includes(endDay) ){
            return {isAvailable: false, message : `User is not available on ${startDate} - ${endDate} ` }
        }
        return {isAvailable:true, message:`Available on ${startDate} - ${endDate}` }
    } catch (error) {
        return {
            isAvailable: false,
            message: "An error occurred while checking availability."
        };
    }
}