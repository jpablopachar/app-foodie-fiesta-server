import { productModel } from '../models/index.js'

export const productRepository = {
  async create(data) {
    return new productModel(data).save()
  },

  async findAll() {
    return productModel.find({})
  },

  async findById(id) {
    return productModel.findById(id)
  },

  async remove(id) {
    return productModel.findByIdAndDelete(id)
  },
}
