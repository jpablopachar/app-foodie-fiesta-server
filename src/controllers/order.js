import { orderService } from '../services/index.js'

/**
 * Controladores HTTP para crear, consultar y actualizar órdenes.
 */
export const orderController = {
  /**
   * Crea una orden con pago contra entrega.
   * @param req Solicitud con los datos de la orden en el cuerpo.
   * @param res Respuesta HTTP.
   * @returns Envía el resultado de la creación.
   */
  async placeOrder(req, res) {
    try {
      await orderService.place(req.body)
      res.json({ success: true, message: 'Orden colocada' })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },

  /**
   * Crea una orden y genera una sesión de pago de Stripe.
   * @param req Solicitud con los datos de la orden en el cuerpo.
   * @param res Respuesta HTTP.
   * @returns Envía la URL de pago o el error.
   */
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

  /**
   * Verifica el resultado de un pago de Stripe.
   * @param req Solicitud con el resultado del pago en el cuerpo.
   * @param res Respuesta HTTP.
   * @returns Envía si el pago se confirmó.
   */
  async verifyStripe(req, res) {
    try {
      const success = await orderService.verifyStripe(req.body)
      res.json({ success })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },

  /**
   * Obtiene todas las órdenes registradas.
   * @param req Solicitud HTTP.
   * @param res Respuesta HTTP.
   * @returns Envía la lista de órdenes o el error.
   */
  async allOrders(req, res) {
    try {
      const orders = await orderService.list()
      res.json({ success: true, orders })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },

  /**
   * Obtiene las órdenes asociadas al usuario indicado.
   * @param req Solicitud con `userId` en el cuerpo.
   * @param res Respuesta HTTP.
   * @returns Envía las órdenes del usuario o el error.
   */
  async userOrders(req, res) {
    try {
      const orders = await orderService.listByUser(req.body.userId)
      res.json({ success: true, orders })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },

  /**
   * Actualiza el estado de una orden.
   * @param req Solicitud con `orderId` y `status` en el cuerpo.
   * @param res Respuesta HTTP.
   * @returns Envía el resultado de la actualización.
   */
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
