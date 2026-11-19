import { cartService } from '../services/index.js'

export const cartController = {
  async addToCart(req, res) {
    try {
      await cartService.add(req.body)
      res.json({ success: true, message: 'Agregado al carrito' })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },

  async updateCart(req, res) {
    try {
      await cartService.update(req.body)
      res.json({ success: true, message: 'Carrito actualizado' })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },

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
