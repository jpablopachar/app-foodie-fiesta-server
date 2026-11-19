import { productService } from '../services/index.js'

/**
 * Controladores HTTP para administrar y consultar productos.
 */
export const productController = {
  /**
   * Crea un producto y carga su imagen si fue proporcionada.
   * @param req Solicitud con los datos del producto y el archivo opcional.
   * @param res Respuesta HTTP.
   * @returns Envía el producto creado o el error.
   */
  async addProduct(req, res) {
    try {
      const product = await productService.add(req.body, req.file?.path)
      res.json({ success: true, message: 'Comida agregada', product })
    } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  /**
   * Elimina un producto por su identificador.
   * @param req Solicitud con el identificador `id` en el cuerpo.
   * @param res Respuesta HTTP.
   * @returns Envía el resultado de la eliminación.
   */
  async removeProduct(req, res) {
    try {
      await productService.remove(req.body.id)
      res.json({ success: true, message: 'Comida eliminada' })
    } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  /**
   * Obtiene todos los productos disponibles.
   * @param req Solicitud HTTP.
   * @param res Respuesta HTTP.
   * @returns Envía la lista de productos o el error.
   */
  async listProduct(req, res) {
    try {
      const products = await productService.list()
      res.json({ success: true, products })
    } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, message: error.message })
    }
  },

  /**
   * Obtiene un producto por su identificador.
   * @param req Solicitud con `productId` en el cuerpo.
   * @param res Respuesta HTTP.
   * @returns Envía el producto o el error.
   */
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
