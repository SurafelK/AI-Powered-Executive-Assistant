import express from 'express'
import { createUserAccount, getAccountEmails, getSuggestion } from '../controller/userSetting'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = express.Router()

router.post('/add',authMiddleware, createUserAccount )
router.get('/acc-emails', authMiddleware, getAccountEmails)
router.get('/get-suggestion', authMiddleware,getSuggestion )
export { router as UserAccountRouter }