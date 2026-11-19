import { orderService } from '../services/index.js'

export const orderController = {
  async placeOrder(req, res) {
    try {
      await orderService.place(req.body)
      res.json({ success: true, message: 'Orden colocada' })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },

  async placeOrderStripe(req, res) {
    try {
      const sessionUrl = await orderService.placeStripe(
        req.body,
        req.headers.origin
      )
      res.json({
        success: true,
        session_url: sessionUrl,
        message: 'Orden colocada',
      })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },

  async verifyStripe(req, res) {
    try {
      const success = await orderService.verifyStripe(req.body)
      res.json({ success })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },

  async allOrders(req, res) {
    try {
      const orders = await orderService.list()
      res.json({ success: true, orders })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },

  async userOrders(req, res) {
    try {
      const orders = await orderService.listByUser(req.body.userId)
      res.json({ success: true, orders })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },

  async updateStatus(req, res) {
    try {
      const { orderId, status } = req.body
      await orderService.updateStatus(orderId, status)
      res.json({ success: true, message: 'Estado actualizado' })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },
}
