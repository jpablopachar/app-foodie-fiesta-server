import { userModel } from '../models/index.js'

export const userRepository = {
  async findByEmail(email) {
    return userModel.findOne({ email })
  },

  async create(data) {
    return new userModel(data).save()
  },

  async getCart(userId) {
    const user = await userModel.findById(userId)
    return user.cartData
  },

  async saveCart(userId, cartData) {
    return userModel.findByIdAndUpdate(userId, { cartData })
  },
}
