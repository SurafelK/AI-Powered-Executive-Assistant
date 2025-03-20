import { CalendarEventModel } from "../model/calendar";
import { UserAccountModel } from "../model/userAccounts"
import { startOfDay, endOfDay, addMinutes, isWithinInterval, isEqual } from "date-fns";
import { UserSettingModel } from "../model/userSetting";

export const getAvailableDate = async (
    userId: string,
    startDate: Date,
    endDate: Date
): Promise<{ available: boolean; message: string; availableSlots?: { start: Date; end: Date }[] }> => {
    try {
        // Get all emails linked to the user
        const userEmails = await UserAccountModel.find({ userId }).lean();
        if (!userEmails || userEmails.length === 0) {
            return { available: false, message: "No account found for user" };
        }

        const emailIds = userEmails.map(({ _id }) => _id);

        // Fetch all events for this user within the given date range
        const events = await CalendarEventModel.find({
            emailId: { $in: emailIds },
            startTime: { $lte: endDate },
            endTime: { $gte: startDate },
        }).lean();

        // Convert event times from ISO string to Date objects
        const formattedEvents = events.map(event => ({
            startTime: new Date(event.startTime), // Convert to Date object
            endTime: new Date(event.endTime), // Convert to Date object
        }));

        // Fetch user working preferences
        const userWorkingPreference = await UserSettingModel.findOne({ userId: userId }); // Fetch a single document

        // Default working hours and time slot duration
        let workingHoursStart = 9 * 60; // Default: 9 AM in minutes
        let workingHoursEnd = 17 * 60; // Default: 5 PM in minutes
        let timeSlotDuration = 30; // Default: 30-minute slots

        if (userWorkingPreference) {
            workingHoursStart = Number(userWorkingPreference.workingHoursStart);
            workingHoursEnd = Number( userWorkingPreference.workingHoursEnd);
            timeSlotDuration = Number(userWorkingPreference.timeSlotDuration);
        } else {
            // Handle the case where no user working preference is found
            console.error("No user working preference found.");
        }

        // Generate available slots
        let availableSlots: { start: Date; end: Date }[] = [];

        let currentDate = startOfDay(startDate);
        while (currentDate <= endOfDay(endDate)) {
            for (let minutes = workingHoursStart; minutes < workingHoursEnd; minutes += timeSlotDuration) {
                const slotStart = addMinutes(currentDate, minutes);
                const slotEnd = addMinutes(slotStart, timeSlotDuration);

                const isConflict = formattedEvents.some(event =>
                    isWithinInterval(slotStart, { start: event.startTime, end: event.endTime }) ||
                    isWithinInterval(slotEnd, { start: event.startTime, end: event.endTime }) ||
                    isEqual(slotStart, event.startTime) ||
                    isEqual(slotEnd, event.endTime)
                );

                if (!isConflict) {
                    availableSlots.push({ start: slotStart, end: slotEnd });
                }
            }

            currentDate = addMinutes(startOfDay(currentDate), 1440); // Move to the next day
        }

        return availableSlots.length > 0
            ? { available: true, message: "User has available slots", availableSlots }
            : { available: false, message: "User is fully booked" };
    } catch (error) {
        console.error("Error checking availability:", error);
        return { available: false, message: "Error occurred while checking availability" };
    }
};

const isAvailable = async (userId: string, startTime: Date, endTime: Date): Promise<boolean> => {
    try {
        const userWorkingDate = await UserSettingModel.findOne({ userId: userId });
        if (!userWorkingDate) return false; // Handle missing settings

        const { workingDays, workingHoursStart, workingHoursEnd } = userWorkingDate;

        const isWithinWorkingHours = await workDayAndTimeAvailability(
            workingDays,
            Number(workingHoursStart),
            Number(workingHoursEnd),
            startTime,
            endTime
        );
        
        return isWithinWorkingHours; // Return the result
    } catch (error) {
        console.error("Error checking availability:", error);
        return false; // Return false in case of an error
    }
};

const workDayAndTimeAvailability = async (
    workingDays: string[],
    timeStart: number,
    timeEnd: number,
    startTime: Date,
    endTime: Date
): Promise<boolean> => {
    const startDay = startTime.toLocaleString("en-US", { weekday: "long" });
    const endDay = endTime.toLocaleString("en-US", { weekday: "long" });

    if (!workingDays.includes(startDay) || !workingDays.includes(endDay)) {
        return false; // Not within working days
    }

    const startHour = startTime.getHours();
    const endHour = endTime.getHours();

    return startHour >= timeStart && endHour <= timeEnd;
};
