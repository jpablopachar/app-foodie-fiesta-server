import { productModel } from '../models/index.js'

/**
 * Operaciones de acceso a datos de productos.
 */
export const productRepository = {
  /**
   * Crea y guarda un producto.
   * @param data Datos del producto que se guardará.
   * @returns Producto creado.
   */
  async create(data) {
    return new productModel(data).save()
  },

  /**
   * Obtiene todos los productos.
   * @returns Lista de productos.
   */
  async findAll() {
    return productModel.find({})
  },

  /**
   * Busca un producto por su identificador.
   * @param id Identificador del producto.
   * @returns Producto encontrado o `null` si no existe.
   */
  async findById(id) {
    return productModel.findById(id)
  },

  /**
   * Elimina un producto por su identificador.
   * @param id Identificador del producto.
   * @returns Producto eliminado o `null` si no existe.
   */
  async remove(id) {
    return productModel.findByIdAndDelete(id)
  },
}
