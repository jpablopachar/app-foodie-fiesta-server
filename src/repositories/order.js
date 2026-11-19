import { orderModel } from '../models/index.js'

/**
 * Operaciones de acceso a datos para las órdenes.
 */
export const orderRepository = {
  /**
   * Crea y guarda una orden.
   * @param data - Datos de la orden.
   * @returns La orden guardada.
   */
  async create(data) {
    return new orderModel(data).save()
  },

  /**
   * Obtiene todas las órdenes.
   * @returns Lista de órdenes.
   */
  async findAll() {
    return orderModel.find({})
  },

  /**
   * Obtiene las órdenes asociadas a un usuario.
   * @param userId - Identificador del usuario.
   * @returns Órdenes del usuario.
   */
  async findByUser(userId) {
    return orderModel.find({ userId })
  },

  /**
   * Marca una orden como pagada.
   * @param id - Identificador de la orden.
   * @returns La orden encontrada antes de actualizarla, o `null` si no existe.
   */
  async markPaid(id) {
    return orderModel.findByIdAndUpdate(id, { payment: true })
  },

  /**
   * Actualiza el estado de una orden.
   * @param id - Identificador de la orden.
   * @param status - Nuevo estado de la orden.
   * @returns La orden encontrada antes de actualizarla, o `null` si no existe.
   */
  async updateStatus(id, status) {
    return orderModel.findByIdAndUpdate(id, { status })
  },

  /**
   * Elimina una orden.
   * @param id - Identificador de la orden.
   * @returns La orden eliminada, o `null` si no existe.
   */
  async remove(id) {
    return orderModel.findByIdAndDelete(id)
  },
}
