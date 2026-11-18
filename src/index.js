import cors from 'cors'
import express from 'express'
import { connectCloudinary, connectDB, env } from './configs/index.js'
import {
  cartRouter,
  orderRouter,
  productRouter,
  userRouter,
} from './routes/index.js'

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
