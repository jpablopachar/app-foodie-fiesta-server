import { Router } from 'express'
import { productController } from '../controllers/index.js'
import { authAdmin, upload } from '../middlewares/index.js'

const productRouter = Router()

productRouter.post(
  '/add',
  authAdmin,
  upload.single('image'),
  productController.addProduct
)
productRouter.post('/remove', authAdmin, productController.removeProduct)
productRouter.post('/single', productController.singleProduct)
productRouter.get('/list', productController.listProduct)

export default productRouter
