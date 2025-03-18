import express from 'express'
import { createUser, getProfile, login } from '../controller/authController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = express.Router()

router.post('/register', createUser )
router.post('/login', login )
router.get('/profile', authMiddleware,getProfile )
export {router as AuthRouter}