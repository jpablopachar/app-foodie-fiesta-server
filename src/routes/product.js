import { Router } from 'express'
import {
  addProduct,
  listProduct,
  removeProduct,
  singleProduct,
} from '../controllers/product.js'
import authAdmin from '../middlewares/auth-admin.js'
import upload from '../middlewares/multer.js'

const productRouter = Router()

productRouter.post('/add', authAdmin, upload.single('image'), addProduct)
productRouter.post('/remove', authAdmin, removeProduct)
productRouter.post('/single', singleProduct)
productRouter.get('/list', listProduct)

export default productRouter
