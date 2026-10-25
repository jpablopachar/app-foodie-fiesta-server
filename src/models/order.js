import { Schema, model, models } from 'mongoose'

/**
 * Esquema de Mongoose para las órdenes.
 * Define los datos obligatorios de la orden.
 */
const orderSchema = new Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, required: true, default: 'Order Placed' },
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, required: true, default: false },
  date: { type: Number, required: true },
})

/**
 * Obtiene el modelo de orden existente o lo crea a partir de `orderSchema`.
 */
const order = models.order || model('order', orderSchema)

export default order
