import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { AuthRouter } from './routers/AuthRouter';
import { dbConnect } from './Config/db';
import { UserAccountRouter } from './routers/accountRouter';
import cron from "node-cron";
import { respondAllEmail } from './Email/emailSupport';
import { CalendarRouter } from './routers/CalendarRouter';
dotenv.config();

const app = express()
app.use(express.json());
app.use(cors());


const PORT = 5000

app.use('/api/auth', AuthRouter )
app.use('/api/account', UserAccountRouter )
app.use('/api/calendar', CalendarRouter )
dbConnect()

// Schedule a job to run every 1 day
cron.schedule("0 0 * * *", async () => {
    console.log("Running email response job...");
    await respondAllEmail();
    console.log("Email response job completed.");
}, {
    scheduled: true,
    timezone: "UTC"  // Adjust the timezone if needed
});


app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))