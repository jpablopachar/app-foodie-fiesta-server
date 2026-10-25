import { v2 as cloudinary } from 'cloudinary'
import productModel from '../models/product.js'

/**
 * Agrega un producto y guarda su imagen y precios.
 * @param req Solicitud con los datos del producto y su imagen.
 * @param res Respuesta HTTP.
 * @returns Envía el resultado de la operación.
 */
const addProduct = async (req, res) => {
  try {
    const { name, description, category, prices, popular } = req.body

    const image = req.file

    let imageUrl

    if (image) {
      const result = await cloudinary.uploader.upload(image.path, {
        resource_type: 'image',
      })

      imageUrl = result.secure_url
    } else {
      imageUrl = 'https://via.placeholder.com/150'
    }

    const parsedPrices = JSON.parse(prices)

    const price = parsedPrices.reduce((acc, curr) => {
      acc[curr.size] = Number(curr.price)
      return acc
    }, {})

    const sizes = parsedPrices.map((item) => item.size)

    const productData = {
      name,
      description,
      category,
      price,
      popular: popular === 'true',
      sizes,
      image: imageUrl,
      date: Date.now(),
    }

    console.log('Datos del producto :', productData)

    const product = new productModel(productData)

    await product.save()

    res.json({ success: true, message: 'Comida agregada', product })
  } catch (error) {
    console.log(error)

    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * Elimina un producto por su identificador.
 * @param req Solicitud con el identificador en el cuerpo.
 * @param res Respuesta HTTP.
 * @returns Envía el resultado de la operación.
 */
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id)

    res.json({ success: true, message: 'Comida eliminada' })
  } catch (error) {
    console.log(error)

    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * Obtiene la lista de todos los productos.
 * @param req Solicitud HTTP.
 * @param res Respuesta HTTP.
 * @returns Envía los productos encontrados.
 */
const listProduct = async (req, res) => {
  try {
    const products = await productModel.find({})

    res.json({ success: true, products })
  } catch (error) {
    console.log(error)

    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * Obtiene un producto por su identificador.
 * @param req Solicitud con el identificador en el cuerpo.
 * @param res Respuesta HTTP.
 * @returns Envía el producto encontrado.
 */
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body
    const product = await productModel.findById(productId)

    res.json({ success: true, product })
  } catch (error) {
    console.log(error)

    res.status(500).json({ success: false, message: error.message })
  }
}

export { addProduct, listProduct, removeProduct, singleProduct }

