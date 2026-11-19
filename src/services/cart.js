import { userRepository } from '../repositories/index.js'

/**
 * Operaciones de negocio para administrar el carrito de compras.
 */
export const cartService = {
  /**
   * Agrega una unidad de un producto y tamaño al carrito de un usuario.
   * @param data Datos de la operación.
   * @param data.userId Identificador del usuario.
   * @param data.itemId Identificador del producto.
   * @param data.size Tamaño del producto.
   * @returns Se resuelve cuando el carrito queda guardado.
   */
  async add({ userId, itemId, size }) {
    const cartData = await userRepository.getCart(userId)

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1
      } else {
        cartData[itemId][size] = 1
      }
    } else {
      cartData[itemId] = {}
      cartData[itemId][size] = 1
    }

    await userRepository.saveCart(userId, cartData)
  },

  /**
   * Establece la cantidad de un producto y tamaño en el carrito.
   * @param data Datos de la operación.
   * @param data.userId Identificador del usuario.
   * @param data.itemId Identificador del producto.
   * @param data.size Tamaño del producto.
   * @param data.quantity Cantidad que se guardará.
   * @returns Se resuelve cuando el carrito queda guardado.
   */
  async update({ userId, itemId, size, quantity }) {
    const cartData = await userRepository.getCart(userId)
    cartData[itemId][size] = quantity
    await userRepository.saveCart(userId, cartData)
  },

  /**
   * Obtiene los datos del carrito de un usuario.
   * @param userId Identificador del usuario.
   * @returns Datos del carrito.
   */
  get(userId) {
    return userRepository.getCart(userId)
  },
}
