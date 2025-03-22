import { startOfDay } from 'date-fns';
import { UserSettingModel } from "../model/userSetting";
import { CalendarEventModel } from '../model/calendar';
import { UserAccountModel } from '../model/userAccounts';

export const checkUserAvailability = async (userId:string, startDate: Date, endDate:Date): Promise<{ isAvailable: boolean; message: string }  > => {
    try {
        const checkCalendar = await CheckUserCalendar(userId, startDate, endDate)
        const checkSchedule = await checkScheduleAvailable(userId, startDate, endDate)

        const userIsAvailable:boolean = checkCalendar.isAvailable && checkSchedule.isAvailable ? true : false

        return { isAvailable: userIsAvailable, message : `${checkCalendar.message} ${ checkCalendar.isAvailable === checkSchedule.isAvailable ? "and" : "but" } ${checkSchedule.message} ` }
    } catch (error){
        return {  isAvailable: false,
            message: "An error occurred while checking availability." }
    }
}

export const dayNames = async (num:number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[num]
      
}

export const CheckUserCalendar = async (userId:string, startDate: Date, endDate:Date): Promise<{ isAvailable: boolean; message: string }  > => {
    try {

        const userEmails = await UserAccountModel.find({
            userId: userId
        })
        const userEmailIds = await userEmails.map(({_id}) => _id )
        const userCheckCalendar = await CalendarEventModel.find({
            userId:{$in: userEmailIds},
            startTime: {$gte: startDate },
            endTime: {$lte: endDate}
        })

        if(!userCheckCalendar || userCheckCalendar.length === 0 ){
           return {isAvailable:true, message:`Calendar is free at ${startDate} - ${endDate}` }
        }

        let startDay = await userCheckCalendar[0].startTime
        const finalDay = await userCheckCalendar[0].endTime
        return {
            isAvailable: false,
            message: `User calendar isn't available on ${startDate} - ${endDate} for ${userCheckCalendar[0]?.title  || "the selected event"} from ${startDate.getMonth() + 1} ${startDay.getDate()} to ${finalDay.getMonth()}`
          };
          
    } catch (error) {
        console.log(error)
        return {isAvailable:true, message:`Error in checking calendar ${startDate} - ${endDate}` }
    }
}

export const checkScheduleAvailable = async (userId:string, startDate: Date, endDate:Date): Promise<{ isAvailable: boolean; message: string }  > => {
    try {
        console.log(startDate, endDate)
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      
        const userSchedule = await UserSettingModel.find({
            userId: userId
        })

        if (!userSchedule || userSchedule.length === 0) {
            const workDate = new Date(startDate)
            const finalDate = new Date(endDate);
            return { isAvailable: false, message:`Not in preffered date ${ dayNames[workDate.getDate()] } at ${workDate.getHours()}: ${workDate.getMinutes()} -
                 ${dayNames[finalDate.getDay()]} - ${finalDate.getHours()} - ${finalDate.getMinutes()} `}
          }
           
          
        const userWorkingDays = userSchedule[0].workingDays

        startDate = new Date(startDate);
        endDate = new Date(endDate);

        const startDay = dayNames[startDate.getDay()];
        const endDay = dayNames[endDate.getDay()];

        if (!userWorkingDays || !userWorkingDays.includes(startDay) || !userWorkingDays.includes(endDay) ){
            return {isAvailable: false, message : `User preference is not on ${startDate}  - ${endDate}  ` }
        }
        return {isAvailable:true, message:`User preference is ${startDate} ${userWorkingDays.includes(startDay)} - ${endDate}  ${userWorkingDays.includes(endDay)}` }
    } catch (error) {
        console.log(error)
        return {
            isAvailable: false,
            message: "An error occurred while checking availability."
        };
    }
}