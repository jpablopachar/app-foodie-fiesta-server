import { v2 as cloudinary } from 'cloudinary'

/**
 * Configura la conexión con Cloudinary usando las variables de entorno.
 * Promesa que se resuelve al completar la configuración.
 */
const connectCloudinary = async () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export default connectCloudinary
