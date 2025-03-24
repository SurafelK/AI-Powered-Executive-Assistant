import express from 'express'
import { createUser, getProfile, isLoggedIn, login } from '../controller/authController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = express.Router()

router.post('/register', createUser )
router.post('/login', login )
router.get('/profile', authMiddleware,getProfile )
router.get('/is-auth', authMiddleware, isLoggedIn)

export {router as AuthRouter}