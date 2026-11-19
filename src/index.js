import { connectCloudinary, connectDB, env } from './configs/index.js'
import app from './app.js'

const startServer = async () => {
  await connectDB()
  await connectCloudinary()

  app.listen(env.port, () => {
    console.log(`✔ Servidor iniciado en el puerto ${env.port}`)
  })
}

startServer()
