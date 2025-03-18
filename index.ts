import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { AuthRouter } from './routers/AuthRouter';
import { dbConnect } from './Config/db';
dotenv.config();

const app = express()
app.use(express.json());
app.use(cors());


const PORT = 5000

app.use('/api/auth', AuthRouter )

dbConnect()

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))