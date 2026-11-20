import cors from 'cors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './configs/swagger.js'
import {
  cartRouter,
  orderRouter,
  productRouter,
  userRouter,
} from './routes/index.js'

/** Aplicación de Express configurada con middleware y rutas de la API. */
const app = express()

app.use(express.json())
app.use(cors())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)

app.get('/', (req, res) => {
  res.send('API funcionando')
})

export default app
