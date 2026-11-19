import { connectCloudinary, connectDB, env } from './configs/index.js'
import app from './app.js'

/**
 * Inicia el servidor después de conectar la base de datos y Cloudinary.
 * @returns Promesa que se resuelve al iniciar el servidor.
 */
const startServer = async () => {
  await connectDB()
  await connectCloudinary()

  app.listen(env.port, () => {
    console.log(`✔ Servidor iniciado en el puerto ${env.port}`)
  })
}

startServer()
