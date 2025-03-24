import { Response } from "express";
import { AuthRequest } from "../Config/express";
import { ICreateCalendarEventInput } from "../dto/calendar.dto";
import { UserAccountModel } from "../model/userAccounts";
import { checkUserAvailability, CheckUserCalendar } from "../Config/CalendarManagment";
import { CalendarEventModel } from '../model/calendar';

export const createCalendar = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            res.status(400).json({ message: "User ID is not provided" });
            return
        }

        const { title, endTime, startTime, attendees, description, location, recurrence, reminders, status, timeZone, email } = 
            req.body as ICreateCalendarEventInput;

        if (!email || !startTime || !endTime || !attendees || attendees.length === 0) {
            res.status(400).json({ message: "Please provide all required fields" });
            return
        }

        const Findmail = await UserAccountModel.findOne({email});

        if (!Findmail ) {
            console.log(Findmail)
            res.status(400).json({ message: "Email not found" });
            return
        }

        if (userId !== Findmail.userId.toString()) {
            res.status(403).json({ message: "This account doesn't belong to you" });
            return
        }

        const checkCalendar = await CheckUserCalendar(userId, startTime, endTime);

        if (checkCalendar && !checkCalendar.isAvailable) {
            res.status(400).json({ message: "Time slot is already booked" });
            return
        }

        const newCalendar = new CalendarEventModel({
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

        await newCalendar.save();

        res.status(201).json({ message: "Event added to calendar successfully", newCalendar });
        return
    } catch (error) {
        console.error("Error creating calendar event:", error);
        res.status(500).json({ message: "Internal server error" });
        return
    }
};

export const DeleteCalendar = async (calendarId: any[] | null) => {
    try {
        if (!calendarId || calendarId.length === 0) return;

        const deleteCalendar = await CalendarEventModel.deleteMany({ _id: { $in: calendarId } });

        console.log(`Deleted ${deleteCalendar.deletedCount} calendar events`);
    } catch (error) {
        console.error("Error deleting calendar events:", error);
    }
};


export const checkCalendar = async (req:AuthRequest, res:Response) => {
    try {
        const userId = req.user.id
        let {startDate, endDate} = req.query
        if(!startDate || !endDate){
            res.status(400).json({message: "StartDate and endDate are required"})
        }
       const FstartDate = new Date (startDate as string )
       const FendDate = new Date (endDate as string )
        const {isAvailable, message} = await checkUserAvailability(userId, FstartDate, FendDate)

        res.status(200).json({isAvailable, message})

    } catch (error) {
        
    }
}

export const getTodaysSchedule = async (req:AuthRequest, res:Response) => {
    try {
        const userId = req.user.id
        const today = new Date()

        const startOfDay = new Date(today.setHours(0,0,0,0));
        const endOfDay = new Date (today.setHours(23,59,59,99))

        const todaysCalendar = await CalendarEventModel.find({
            userId: userId,
            startTime: {$gte: startOfDay},
            endTime: {$lte: endOfDay}
        })

        res.status(200).json({message: "Todays schedule", todaysCalendar })
        return

    } catch (error) {
        
    }
}


export const getCalendars = async (req:AuthRequest, res:Response) => {
    try {
        const userId = req.user.id
        const userCalenders = await CalendarEventModel.find({
            userId: userId
        })

        if (!userCalenders || userCalenders.length === 0 )
        {
            res.status(200).json({message: "You don't have any calendar yet"})
            return
        }

        res.status(200).json({message: "retrieved Calendar", userCalenders})
        return
    } catch (error) {
        res.status(500).json({message: "Internal server error"})
        return
    }
}


export const editCalendars = async (req:AuthRequest, res:Response) => {
    try {
        const {title, startTime, endTime, attendees, description, location, recurrence, reminders, status, timeZone, email} =  <ICreateCalendarEventInput> req.body 
        const calendarId = req.params.id
        if(!calendarId){
            res.status(400).json({message: "Calendar ID is required"})
            return
        }

        const findCalendar = await CalendarEventModel.findOne({userId: req.user.id, _id: calendarId})
        if(!findCalendar){
            res.status(404).json({message: "Calendar not found"})
            return
        }
    
        const updateCalendar = await CalendarEventModel.findOneAndUpdate(
            {_id: calendarId},
            {title, startTime, endTime, attendees, description, location, recurrence, reminders, status, timeZone, email},
            {new: true})
    
        if(!updateCalendar){
            res.status(404).json({message: "Calendar not found"})
            return
        }
        res.status(200).json({message: "Calendar updated successfully", updateCalendar})
        return
    } catch (error) {
        res.status(500).json({message: "Internal server error"})
        return
    }
    }