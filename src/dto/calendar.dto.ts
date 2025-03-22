export interface ICreateCalendarEventInput {
    userId: string; 
    email: string;
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
      interval?: number;
    };
    attendees?: {
      email: string;
      status?: "accepted" | "declined" | "tentative" | "invited";
    }[];
    status?: "confirmed" | "tentative" | "cancelled";
  }
  