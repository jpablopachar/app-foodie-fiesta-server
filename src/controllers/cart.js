import userModel from '../models/user.js'

/**
 * Agrega una unidad de un producto y talla al carrito del usuario.
 *
 * @param req Solicitud con `userId`, `itemId` y `size` en el cuerpo.
 * @param res Respuesta HTTP con el resultado de la operación.
 * @returns  Envía una respuesta indicando si el producto se agregó correctamente.
 */
const addToCart = async (req, res) => {
  try {
    const { userId, itemId, size } = req.body

    const userData = await userModel.findById(userId)
    const cartData = await userData.cartData

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

    await userModel.findByIdAndUpdate(userId, { cartData })

    res.json({ success: true, message: 'Agregado al carrito' })
  } catch (error) {
    console.log(error)

    res.json({ success: false, message: error.message })
  }
}

/**
 * Actualiza la cantidad de un producto y talla en el carrito del usuario.
 *
 * @param req Solicitud con `userId`, `itemId`, `size` y `quantity` en el cuerpo.
 * @param res Respuesta HTTP con el resultado de la operación.
 * @returns Envía una respuesta indicando si el carrito se actualizó correctamente.
 */
const updateCart = async (req, res) => {
  try {
    const { userId, itemId, size, quantity } = req.body

    const userData = await userModel.findById(userId)
    const cartData = await userData.cartData

    cartData[itemId][size] = quantity

    await userModel.findByIdAndUpdate(userId, { cartData })

    res.json({ success: true, message: 'Carrito actualizado' })
  } catch (error) {
    console.log(error)

    res.json({ success: false, message: error.message })
  }
}

/**
 * Obtiene los productos y cantidades del carrito de un usuario.
 *
 * @param req Solicitud con `userId` en el cuerpo.
 * @param res Respuesta HTTP con los datos del carrito o un error.
 * @returns Envía una respuesta con los datos del carrito.
 */
const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body

    const userData = await userModel.findById(userId)
    const cartData = await userData.cartData

    res.json({ success: true, cartData })
  } catch (error) {
    console.log(error)

    res.json({ success: false, message: error.message })
  }
}

export { addToCart, getUserCart, updateCart }

