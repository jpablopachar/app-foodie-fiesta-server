import { Schema, model, models } from "mongoose"

/**
 * Esquema de Mongoose para los productos.
 * Define los datos obligatorios del producto.
 */
const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Object, required: true },
  date: { type: Number, required: true },
  sizes: { type: Array, required: true },
  popular: { type: Boolean },
})

/**
 * Obtiene el modelo de producto existente o lo crea a partir de `productSchema`.
 */
const product = models.product || model("product", productSchema);

export default product
