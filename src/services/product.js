import { v2 as cloudinary } from 'cloudinary'
import { productRepository } from '../repositories/index.js'

export const productService = {
  async add({ name, description, category, prices, popular }, imagePath) {
    let imageUrl = 'https://via.placeholder.com/150'

    if (imagePath) {
      const result = await cloudinary.uploader.upload(imagePath, {
        resource_type: 'image',
      })

      imageUrl = result.secure_url
    }

    const parsedPrices = JSON.parse(prices)
    const price = parsedPrices.reduce((acc, curr) => {
      acc[curr.size] = Number(curr.price)
      return acc
    }, {})

    const productData = {
      name,
      description,
      category,
      price,
      popular: popular === 'true',
      sizes: parsedPrices.map((item) => item.size),
      image: imageUrl,
      date: Date.now(),
    }

    console.log('Datos del producto :', productData)

    return productRepository.create(productData)
  },

  remove(id) {
    return productRepository.remove(id)
  },

  list() {
    return productRepository.findAll()
  },

  get(id) {
    return productRepository.findById(id)
  },
}
