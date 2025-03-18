import express from 'express'
import { createUserAccount } from '../controller/userSetting'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = express.Router()

router.post('/add',authMiddleware, createUserAccount )

export { router as UserAccountRouter }