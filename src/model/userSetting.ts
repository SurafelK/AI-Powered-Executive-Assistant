import mongoose, { model, Document, Schema } from "mongoose";

// User Settings Schema Interface
interface IUserSetting extends Document {
    userId: mongoose.Types.ObjectId; // Reference to User
    workingDays: string[]; // Example: ["Monday", "Tuesday", "Wednesday"]
    workingHoursStart: string; // Example: "09:00"
    workingHoursEnd: string;   // Example: "17:00"
    timeSlotDuration: number;  // Example: 30 (minutes)
    ethCalendar: Boolean
}

// Define User Setting Schema
const UserSettingSchema = new Schema<IUserSetting>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    workingDays: { 
        type: [String], 
        required: true, 
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] 
    },
    workingHoursStart: { type: String, required: true }, 
    workingHoursEnd: { type: String, required: true },
    timeSlotDuration: { type: Number, required: true },
    ethCalendar:{ type:Boolean, default: false }
});

// Create and Export Model
const UserSetting = model<IUserSetting>("UserSetting", UserSettingSchema);
export { UserSetting as UserSettingModel };
