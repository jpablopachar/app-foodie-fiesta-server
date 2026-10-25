import { Router } from 'express'
import {
  adminLogin,
  loginUser,
  registerUser,
} from '../controllers/user.js'

const userRouter = Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)

export default userRouter
