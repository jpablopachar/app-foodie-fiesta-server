import 'dotenv/config'

/**
 * Variables de entorno de la aplicación.
 * Único punto de lectura de `process.env`: el resto del código debe importar
 * este objeto en lugar de acceder directamente a `process.env`.
 */
export const env = Object.freeze({
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPass: process.env.ADMIN_PASS,
  cloudinaryName: process.env.CLOUDINARY_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
})
