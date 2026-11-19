import { cartService } from '../services/index.js'

/**
 * Controladores HTTP para las operaciones del carrito de compras.
 */
export const cartController = {
  /**
   * Agrega una unidad de un producto al carrito del usuario.
   * @param req Solicitud con `userId`, `itemId` y `size` en el cuerpo.
   * @param res Respuesta HTTP.
   * @returns Envía el resultado de la operación.
   */
  async addToCart(req, res) {
    try {
      await cartService.add(req.body)
      res.json({ success: true, message: 'Agregado al carrito' })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },

  /**
   * Actualiza la cantidad de un producto en el carrito del usuario.
   * @param req Solicitud con `userId`, `itemId`, `size` y `quantity`.
   * @param res Respuesta HTTP.
   * @returns Envía el resultado de la operación.
   */
  async updateCart(req, res) {
    try {
      await cartService.update(req.body)
      res.json({ success: true, message: 'Carrito actualizado' })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },

  /**
   * Obtiene el carrito de un usuario.
   * @param req Solicitud con `userId` en el cuerpo.
   * @param res Respuesta HTTP.
   * @returns Envía los datos del carrito o el error.
   */
  async getUserCart(req, res) {
    try {
      const cartData = await cartService.get(req.body.userId)
      res.json({ success: true, cartData })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },
}
