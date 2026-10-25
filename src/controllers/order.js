import Stripe from 'stripe'
import orderModel from '../models/order.js'
import userModel from '../models/user.js'

/** Moneda utilizada para los pagos procesados con Stripe. */
const currency = 'pkr'
/** Cargo fijo de entrega aplicado a cada pedido, expresado en la moneda configurada. */
const deliveryCharges = 10
/** Cliente de Stripe configurado con la clave secreta del entorno. */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

/**
 * Crea un pedido con pago contra entrega y vacía el carrito del usuario.
 * @param req Solicitud con los datos del pedido en `body`.
 * @param res Respuesta HTTP.
 * @returns Envía el resultado de la creación del pedido.
 */
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body
    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: 'COD',
      payment: false,
      date: Date.now(),
    }

    const newOrder = new orderModel(orderData)

    await newOrder.save()
    await userModel.findByIdAndUpdate(userId, { cartData: {} })

    res.json({ success: true, message: 'Orden colocada' })
  } catch (error) {
    console.log(error)

    res.json({ success: false, message: error.message })
  }
}

/**
 * Crea un pedido y una sesión de pago de Stripe con sus artículos y el cargo de entrega.
 * @param req Solicitud con los datos del pedido en `body` y el origen en los encabezados.
 * @param res Respuesta HTTP con la URL de pago o un error.
 * @returns Envía el resultado de la creación de la sesión de pago.
 */
const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body
    const { origin } = req.headers
    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: 'Stripe',
      payment: false,
      date: Date.now(),
    }

    const newOrder = new orderModel(orderData)

    await newOrder.save()

    const lineItems = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: item.price[item.size] * 100 * 277,
      },
      quantity: item.quantity,
    }))

    lineItems.push({
      price_data: {
        currency: currency,
        product_data: {
          name: 'Delivery_Charges',
        },
        unit_amount: deliveryCharges * 100 * 277,
      },
      quantity: 1,
    })

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items: lineItems,
      mode: 'payment',
    })

    res.json({
      success: true,
      session_url: session.url,
      message: 'Orden colocada',
    })
  } catch (error) {
    console.log(error)

    res.json({ success: false, message: error.message })
  }
}

/**
 * Confirma el pago de Stripe y vacía el carrito, o elimina el pedido si el pago falla.
 * @param req Solicitud con `orderId`, `success` y `userId` en `body`.
 * @param res Respuesta HTTP con el resultado de la verificación.
 * @returns Envía el resultado de la verificación del pago.
 */
const verifyStripe = async (req, res) => {
  const { orderId, success, userId } = req.body
  try {
    if (success === 'true') {
      await orderModel.findByIdAndUpdate(orderId, { payment: true })
      await userModel.findByIdAndUpdate(userId, { cartData: {} })

      res.json({ success: true })
    } else {
      await orderModel.findByIdAndDelete(orderId)

      res.json({ success: false })
    }
  } catch (error) {
    console.log(error)

    res.json({ success: false, message: error.message })
  }
}

/**
 * Obtiene todos los pedidos registrados.
 * @param req Solicitud HTTP.
 * @param res Respuesta HTTP con los pedidos o un error.
 * @returns Envía la lista de pedidos.
 */
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({})

    res.json({ success: true, orders })
  } catch (error) {
    console.log(error)

    res.json({ success: false, message: error.message })
  }
}

/**
 * Obtiene los pedidos asociados a un usuario.
 * @param req Solicitud con `userId` en `body`.
 * @param res Respuesta HTTP con los pedidos o un error.
 * @returns Envía la lista de pedidos del usuario.
 */
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body
    const orders = await orderModel.find({ userId })

    res.json({ success: true, orders })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

/**
 * Actualiza el estado de un pedido.
 * @param req Solicitud con `orderId` y `status` en `body`.
 * @param res Respuesta HTTP con el resultado de la actualización.
 * @returns Envía la confirmación de la actualización o un error.
 */
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body

    await orderModel.findByIdAndUpdate(orderId, { status })

    res.json({ success: true, message: 'Estado actualizado' })
  } catch (error) {
    console.log(error)

    res.json({ success: false, message: error.message })
  }
}

export {
  allOrders,
  placeOrder,
  placeOrderStripe,
  updateStatus,
  userOrders,
  verifyStripe
}

