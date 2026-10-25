import { Router } from 'express'
import {
  allOrders,
  placeOrder,
  placeOrderStripe,
  updateStatus,
  userOrders,
  verifyStripe,
} from '../controllers/order.js'
import authAdmin from '../middlewares/auth-admin.js'
import authUser from '../middlewares/auth.js'

const orderRouter = Router()

// Administrador
orderRouter.post('/list', authAdmin, allOrders)
orderRouter.post('/status', authAdmin, updateStatus)

// Usuario
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.post('/verifyStripe', authUser, verifyStripe)
orderRouter.post('/userOrders', authUser, userOrders)

export default orderRouter
