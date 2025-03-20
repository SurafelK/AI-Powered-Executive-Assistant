import mongoose, { model, Document, Schema } from "mongoose";

interface ICalendarEvent extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  emailId: mongoose.Schema.Types.ObjectId;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  timeZone?: string;
  reminders?: {
    timeBeforeEvent: number;
    method: "email" | "push_notification";
  }[];
  recurrence?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly" | "none";
    interval: number;
  };
  attendees?: {
    email: string;
    status: "accepted" | "declined" | "tentative" | "invited";
  }[];
  status: "confirmed" | "tentative" | "cancelled";
  createdAt: Date;
}

const CalendarEventSchema = new Schema<ICalendarEvent>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  emailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserAccount",
    required: true
  },
  title: {type: String, required: true, maxlength: 120},
  description: {
    type: String
  },
  location: {
    type: String
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  timeZone: {
    type: String,
    default: "UTC"
  },
  reminders: [
    {
      timeBeforeEvent: {
        type: Number,
        required: true
      },
      method: {
        type: String,
        enum: ["email", "push_notification"],
        default: "email"
      }
    }
  ],
  recurrence: {
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly", "none"],
      default: "none"
    },
    interval: {
      type: Number,
      default: 1
    }
  },
  attendees: [
    {
      email: { type: String },
      status: {
        type: String,
        enum: ["accepted", "declined", "tentative", "invited"],
        default: "invited"
      }
    }
  ],
  status: {
    type: String,
    enum: ["confirmed", "tentative", "cancelled"],
    default: "confirmed"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CalendarEvent = model<ICalendarEvent>("CalendarEvent", CalendarEventSchema);
export {CalendarEvent as CalendarEventModel };
