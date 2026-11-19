import { Router } from 'express'
import { cartController } from '../controllers/index.js'
import { authUser } from '../middlewares/index.js'

const cartRouter = Router()

cartRouter.post('/add', authUser, cartController.addToCart)
cartRouter.post('/update', authUser, cartController.updateCart)
cartRouter.post('/get', authUser, cartController.getUserCart)

export default cartRouter
