import { Router } from 'express'
import { orderController } from '../controllers/index.js'
import { authAdmin, authUser } from '../middlewares/index.js'

const orderRouter = Router()

// Administrador
orderRouter.post('/list', authAdmin, orderController.allOrders)
orderRouter.post('/status', authAdmin, orderController.updateStatus)

// Usuario
orderRouter.post('/place', authUser, orderController.placeOrder)
orderRouter.post('/stripe', authUser, orderController.placeOrderStripe)
orderRouter.post('/verifyStripe', authUser, orderController.verifyStripe)
orderRouter.post('/userOrders', authUser, orderController.userOrders)

export default orderRouter
