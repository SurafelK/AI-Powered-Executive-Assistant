import express from 'express'
import { createUserAccount, getAccountEmails, getAllAccounts, getSuggestion } from '../controller/userSetting'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = express.Router()

router.post('/add',authMiddleware, createUserAccount )
router.get('/acc-emails', authMiddleware, getAccountEmails)
router.get('/get-suggestion', authMiddleware,getSuggestion )
router.get('/all-accounts', authMiddleware, getAllAccounts)
export { router as UserAccountRouter }