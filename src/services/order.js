import Stripe from 'stripe'
import { env } from '../configs/index.js'
import { orderRepository, userRepository } from '../repositories/index.js'

const currency = 'pkr'
const deliveryCharges = 10
const stripe = new Stripe(env.stripeSecretKey)

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

export const orderService = {
  async place(data) {
    await createOrder(data, 'COD')
    await userRepository.saveCart(data.userId, {})
  },

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

  async verifyStripe({ orderId, success, userId }) {
    if (success === 'true') {
      await orderRepository.markPaid(orderId)
      await userRepository.saveCart(userId, {})
      return true
    }

    await orderRepository.remove(orderId)
    return false
  },

  list() {
    return orderRepository.findAll()
  },

  listByUser(userId) {
    return orderRepository.findByUser(userId)
  },

  updateStatus(orderId, status) {
    return orderRepository.updateStatus(orderId, status)
  },
}
