import { orderModel } from '../models/index.js'

export const orderRepository = {
  async create(data) {
    return new orderModel(data).save()
  },

  async findAll() {
    return orderModel.find({})
  },

  async findByUser(userId) {
    return orderModel.find({ userId })
  },

  async markPaid(id) {
    return orderModel.findByIdAndUpdate(id, { payment: true })
  },

  async updateStatus(id, status) {
    return orderModel.findByIdAndUpdate(id, { status })
  },

  async remove(id) {
    return orderModel.findByIdAndDelete(id)
  },
}
