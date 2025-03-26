import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { AuthRouter } from './routers/AuthRouter';
import { dbConnect } from './Config/db';
import { UserAccountRouter } from './routers/accountRouter';
import cron from "node-cron";
import { respondAllEmail } from './Email/emailSupport';
import { CalendarRouter } from './routers/CalendarRouter';
import cookieParser from "cookie-parser";
import { WorkingSettingRouter } from './routers/accountPreferenceRouter';

dotenv.config();

const app = express()


const corsOptions = {
  origin: [
    'https://ai-poweredexecutive-assistant-frontend.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

// Routes
app.use('/api/auth', AuthRouter);
app.use('/api/account', UserAccountRouter);
app.use('/api/calendar', CalendarRouter);
app.use('/api/working-hours', WorkingSettingRouter);

// Database connection
dbConnect();

// Scheduled job for email responses
cron.schedule("0 0 * * *", async () => {
    console.log("Running email response job...");
    await respondAllEmail();
    console.log("Email response job completed.");
}, {
    scheduled: true,
    timezone: "UTC"
});




app.listen(PORT, () => console.log(`Server running on port ${PORT}`));