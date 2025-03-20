export interface IUserWorkingHourSettingInput {
    userId: string; // Reference to User
    workingDays: string[]; // Example: ["Monday", "Tuesday", "Wednesday"]
    workingHoursStart: string; // Example: "09:00"
    workingHoursEnd: string;   // Example: "17:00"
    timeSlotDuration: number;  // Example: 30 (minutes)
    ethCalendar: boolean; // Use lowercase "boolean" for TypeScript
}
