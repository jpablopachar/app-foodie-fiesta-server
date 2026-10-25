import { v2 as cloudinary } from 'cloudinary'
import { env } from './env.js'

/**
 * Configura la conexión con Cloudinary usando las variables de entorno.
 * Promesa que se resuelve al completar la configuración.
 */
const connectCloudinary = async () => {
  cloudinary.config({
    cloud_name: env.cloudinaryName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  })
}

export default connectCloudinary
