import Stripe from 'stripe'
import { env } from '../configs/index.js'
import { orderRepository, userRepository } from '../repositories/index.js'

/** Código de moneda que se utiliza al crear sesiones de pago en Stripe. */
const currency = 'pkr'

/** Importe fijo añadido a cada compra por concepto de entrega. */
const deliveryCharges = 10

/** Cliente de Stripe configurado con la clave secreta de la aplicación. */
const stripe = new Stripe(env.stripeSecretKey)

/**
 * Crea una orden y registra su método de pago y fecha de creación.
 * @param data - Datos principales de la orden.
 * @param data.userId - Identificador del usuario.
 * @param data.items - Productos incluidos en la orden.
 * @param data.amount - Importe total de la orden.
 * @param data.address - Dirección de entrega.
 * @param paymentMethod - Método de pago utilizado.
 * @returns La orden creada.
 */
const createOrder = ({ userId, items, amount, address }, paymentMethod) =>
  orderRepository.create({
    userId,
    items,
    amount,
    address,
    paymentMethod,
    payment: false,
    date: Date.now(),
  })

/**
 * Operaciones de negocio para la creación y gestión de órdenes.
 */
export const orderService = {
  /**
   * Crea una orden con pago contra entrega y vacía el carrito del usuario.
   * @param data - Datos de la orden.
   */
  async place(data) {
    await createOrder(data, 'COD')
    await userRepository.saveCart(data.userId, {})
  },

  /**
   * Crea una orden y una sesión de pago de Stripe.
   * @param data - Datos de la orden y sus productos.
   * @param origin - URL base utilizada para las rutas de éxito y cancelación.
   * @returns URL de la sesión de pago de Stripe.
   */
  async placeStripe(data, origin) {
    const order = await createOrder(data, 'Stripe')

    const lineItems = data.items.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.name,
        },
        unit_amount: item.price[item.size] * 100 * 277,
      },
      quantity: item.quantity,
    }))

    lineItems.push({
      price_data: {
        currency,
        product_data: {
          name: 'Delivery_Charges',
        },
        unit_amount: deliveryCharges * 100 * 277,
      },
      quantity: 1,
    })

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${order._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${order._id}`,
      line_items: lineItems,
      mode: 'payment',
    })

    return session.url
  },

  /**
   * Confirma el pago de Stripe o elimina la orden si el pago no se completó.
   * Si el pago se confirma, también vacía el carrito del usuario.
   * @param data - Resultado de la verificación y datos de la orden.
   * @param data.orderId - Identificador de la orden.
   * @param data.success - Indicador de éxito recibido desde Stripe.
   * @param data.userId - Identificador del usuario.
   * @returns `true` si el pago se confirmó; de lo contrario, `false`.
   */
  async verifyStripe({ orderId, success, userId }) {
    if (success === 'true') {
      await orderRepository.markPaid(orderId)
      await userRepository.saveCart(userId, {})
      return true
    }

    await orderRepository.remove(orderId)
    return false
  },

  /**
   * Obtiene todas las órdenes.
   * @returns Lista de órdenes.
   */
  list() {
    return orderRepository.findAll()
  },

  /**
   * Obtiene las órdenes de un usuario.
   * @param userId - Identificador del usuario.
   * @returns Órdenes del usuario.
   */
  listByUser(userId) {
    return orderRepository.findByUser(userId)
  },

  /**
   * Actualiza el estado de una orden.
   * @param orderId - Identificador de la orden.
   * @param status - Nuevo estado de la orden.
   * @returns La orden encontrada antes de actualizarla, o `null` si no existe.
   */
  updateStatus(orderId, status) {
    return orderRepository.updateStatus(orderId, status)
  },
}
