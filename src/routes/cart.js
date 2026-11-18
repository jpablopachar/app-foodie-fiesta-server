import { Router } from 'express'
import { addToCart, getUserCart, updateCart } from '../controllers/index.js'
import { authUser } from '../middlewares/index.js'

const cartRouter = Router()

cartRouter.post('/add', authUser, addToCart)
cartRouter.post('/update', authUser, updateCart)
cartRouter.post('/get', authUser, getUserCart)

export default cartRouter
