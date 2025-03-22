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

export const CheckUserCalendar = async (
    userId: string,
    startDate: any,
    endDate: any
  ): Promise<{ isAvailable: boolean; message: string; calendar?: any[] }> => {
    try {

      const start = new Date(startDate);
      const end = new Date(endDate);

      console.log(start)
      console.log(end)
  
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return { isAvailable: false, message: "Invalid date format provided." };
      }
  

      const userAccounts = await UserAccountModel.find({ userId });
      if (!userAccounts.length) {
        return { isAvailable: true, message: "User account not found." };
      }
  
    //   const userEmailIds = userAccounts.map(({ _id }) => {
    //     _id
    //   });
    //   console.log(userEmailIds)
      const userCheckCalendar = await CalendarEventModel.find({
        userId: userId,
        startTime: { $gte: start },
        endTime: { $lte: end },
      });
  

      if (!userCheckCalendar  || userCheckCalendar.length === 0 ) {
        console.log(userCheckCalendar)
        return {
          isAvailable: true,
          message: `User is available from ${start.toDateString()} to ${end.toDateString()}.`,
        };
      }

      const firstEvent = userCheckCalendar[0];
      const formattedStartDate = firstEvent?.startTime
        ? firstEvent.startTime.toLocaleDateString()
        : start.toLocaleDateString();
      const formattedEndDate = firstEvent?.endTime
        ? firstEvent.endTime.toLocaleDateString()
        : end.toLocaleDateString();
      const eventTitle = firstEvent?.title || "the selected event";
  
      return {
        isAvailable: false,
        message: `User is busy from ${formattedStartDate} to ${formattedEndDate} for ${eventTitle}.`,
        calendar: userCheckCalendar,
      };
    } catch (error) {
      console.error(error);
      return {
        isAvailable: true,
        message: `Error checking calendar between ${startDate} and ${endDate}.`,
      };
    }
  };
  

export const checkScheduleAvailable = async (userId:string, startDate: Date, endDate:Date): Promise<{ isAvailable: boolean; message: string }  > => {
    try {
        console.log(startDate, endDate)
        const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      
        const userSchedule = await UserSettingModel.find({
            userId: userId
        })

        if (!userSchedule || userSchedule.length === 0) {
            const workDate = new Date(startDate)
            const finalDate = new Date(endDate);
            return { isAvailable: false, message:`Not in preffered date on ${ dayName[workDate.getDay()] } at ${workDate.getHours()}: ${workDate.getMinutes()} -
                 ${ dayName[workDate.getDay()]} - ${finalDate.getHours()}:${finalDate.getMinutes()} `}
          }
           
          
        const userWorkingDays = userSchedule[0].workingDays

        startDate = new Date(startDate);
        endDate = new Date(endDate);

        const startDay = dayName[startDate.getDay()];
        const endDay = dayName[endDate.getDay()];

        if (!userWorkingDays || !userWorkingDays.includes(startDay) || !userWorkingDays.includes(endDay) ){
            return {isAvailable: false, message : `User preference is not on ${startDay}  - ${endDate}  ` }
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