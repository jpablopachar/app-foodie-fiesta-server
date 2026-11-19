import { userRepository } from '../repositories/index.js'

export const cartService = {
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

  async update({ userId, itemId, size, quantity }) {
    const cartData = await userRepository.getCart(userId)
    cartData[itemId][size] = quantity
    await userRepository.saveCart(userId, cartData)
  },

  get(userId) {
    return userRepository.getCart(userId)
  },
}
