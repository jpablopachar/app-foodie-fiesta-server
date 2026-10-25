import cors from 'cors'
import express from 'express'
import { env } from './configs/env.js'
import connectCloudinary from './configs/cloudinary.js'
import connectDB from './configs/mongodb.js'
import cartRouter from './routes/cart.js'
import orderRouter from './routes/order.js'
import productRouter from './routes/product.js'
import userRouter from './routes/user.js'

const app = express()

app.use(express.json())
app.use(cors())

app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)

app.get('/', (req, res) => {
  res.send('API funcionando')
})

const startServer = async () => {
  await connectDB()
  await connectCloudinary()

  app.listen(env.port, () => {
    console.log(`✔ Servidor iniciado en el puerto ${env.port}`)
  })
}

startServer()
