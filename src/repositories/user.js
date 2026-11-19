import { userModel } from '../models/index.js'

/**
 * Operaciones de acceso a datos de usuarios y carritos.
 */
export const userRepository = {
  /**
   * Busca un usuario por su correo electrónico.
   * @param email Correo electrónico del usuario.
   * @returns Usuario encontrado o `null` si no existe.
   */
  async findByEmail(email) {
    return userModel.findOne({ email })
  },

  /**
   * Crea y guarda un usuario.
   * @param data Datos del usuario que se guardará.
   * @returns Usuario creado.
   */
  async create(data) {
    return new userModel(data).save()
  },

  /**
   * Obtiene los datos del carrito de un usuario.
   * @param userId Identificador del usuario.
   * @returns Datos del carrito.
   */
  async getCart(userId) {
    const user = await userModel.findById(userId)
    return user.cartData
  },

  /**
   * Guarda los datos del carrito de un usuario.
   * @param userId Identificador del usuario.
   * @param cartData Datos actualizados del carrito.
   * @returns Usuario actualizado o `null` si no existe.
   */
  async saveCart(userId, cartData) {
    return userModel.findByIdAndUpdate(userId, { cartData })
  },
}
