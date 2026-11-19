import { productService } from '../services/index.js'

export const productController = {
  async addProduct(req, res) {
    try {
      const product = await productService.add(req.body, req.file?.path)
      res.json({ success: true, message: 'Comida agregada', product })
    } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async removeProduct(req, res) {
    try {
      await productService.remove(req.body.id)
      res.json({ success: true, message: 'Comida eliminada' })
    } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async listProduct(req, res) {
    try {
      const products = await productService.list()
      res.json({ success: true, products })
    } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async singleProduct(req, res) {
    try {
      const product = await productService.get(req.body.productId)
      res.json({ success: true, product })
    } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },
}
