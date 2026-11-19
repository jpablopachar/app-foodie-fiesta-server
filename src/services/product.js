import { v2 as cloudinary } from 'cloudinary'
import { productRepository } from '../repositories/index.js'

/**
 * Operaciones de negocio para crear, consultar y eliminar productos.
 */
export const productService = {
  /**
   * Procesa los datos de un producto, carga su imagen opcional y lo guarda.
   * @param data Datos del producto: nombre, descripción, categoría, precios y popularidad.
   * @param data.name Nombre del producto.
   * @param data.description Descripción del producto.
   * @param data.category Categoría del producto.
   * @param data.prices Precios y tamaños serializados como JSON.
   * @param data.popular Indicador de producto popular.
   * @param [imagePath] Ruta local de la imagen opcional.
   * @returns Producto creado.
   */
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

  /**
   * Elimina un producto por su identificador.
   * @param id Identificador del producto.
   * @returns Producto eliminado o `null` si no existe.
   */
  remove(id) {
    return productRepository.remove(id)
  },

  /**
   * Obtiene todos los productos.
   * @returns Lista de productos.
   */
  list() {
    return productRepository.findAll()
  },

  /**
   * Obtiene un producto por su identificador.
   * @param id Identificador del producto.
   * @returns Producto encontrado o `null` si no existe.
   */
  get(id) {
    return productRepository.findById(id)
  },
}
