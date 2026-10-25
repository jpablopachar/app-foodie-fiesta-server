import { Schema, model, models } from 'mongoose'

/**
 * Esquema de Mongoose para los usuarios.
 * Define los datos obligatorios del usuario y su carrito de compras.
 * La opción `minimize: false` conserva los objetos vacíos al guardar.
 */
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
  },
  { minimize: false }
)

/**
 * Obtiene el modelo de usuario existente o lo crea a partir de `userSchema`.
 */
const user = models.user || model("user", userSchema)

export default user
