import express from 'express'
import { createUser } from '../controller/authController'

const router = express.Router()

router.post('/create', createUser )

export {router as AuthRouter}