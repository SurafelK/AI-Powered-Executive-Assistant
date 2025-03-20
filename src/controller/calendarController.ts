import { Response } from "express";
import { AuthRequest } from "../Config/express";
import { ICreateCalendarEventInput } from "../dto/calendar.dto";
import { UserAccountModel } from "../model/userAccounts";

export const createCalendar = async (req:AuthRequest, res:Response) => {
    try {
        const emailId = req.params.email
        const userId = req.user.id

        if(!userId ){
            res.status(400).json({message: "Email is not provided"})
            return
        }
        const {title, endTime, startTime, attendees, description, location, recurrence, reminders, status, timeZone} = <ICreateCalendarEventInput> req.body

        if( !emailId || !title || !startTime || !endTime || !attendees || attendees.length === 0 ){
            res.status(400).json({message: "Please provide all required fields"})
            return
        }

        const email = await UserAccountModel.findById(emailId)

        if(!email){
            res.status(400).json({message: "Email is not provided"})
            return
        }

        if( userId !== email.userId.toString() ){
            res.status(400).json({message: "This account doesn't belongs to you"})
            return
        }

        const checkAvailability = 0

    } catch (error) {
        
    }
}