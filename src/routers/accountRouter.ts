import express from 'express'
import { createUserAccount, getAccountEmails, getAllAccounts, getSuggestion, sendResponses } from '../controller/userAccounts'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = express.Router()

router.post('/add',authMiddleware, createUserAccount )
router.get('/acc-emails/:email', authMiddleware, getAccountEmails)
router.post('/get-suggestion', authMiddleware,getSuggestion )
router.get('/all-accounts', authMiddleware, getAllAccounts)
router.post('/send', authMiddleware, sendResponses)
export { router as UserAccountRouter }