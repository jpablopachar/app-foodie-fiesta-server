import { beforeEach, describe, expect, it, vi } from 'vitest'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import request from 'supertest'

const mocks = vi.hoisted(() => ({
  productCreate: vi.fn(),
  productRemove: vi.fn(),
  productFindAll: vi.fn(),
  productFindById: vi.fn(),
  userFindByEmail: vi.fn(),
  userCreate: vi.fn(),
  getCart: vi.fn(),
  saveCart: vi.fn(),
  orderCreate: vi.fn(),
  orderFindAll: vi.fn(),
  orderFindByUser: vi.fn(),
  markPaid: vi.fn(),
  updateStatus: vi.fn(),
  orderRemove: vi.fn(),
  stripeCreate: vi.fn(),
}))

vi.mock('../../src/configs/index.js', () => ({
  env: {
    jwtSecret: 'integration-secret',
    adminEmail: 'admin@example.com',
    adminPass: 'admin-password',
    stripeSecretKey: 'sk_test_integration',
  },
}))

vi.mock('../../src/repositories/index.js', () => ({
  productRepository: {
    create: mocks.productCreate,
    remove: mocks.productRemove,
    findAll: mocks.productFindAll,
    findById: mocks.productFindById,
  },
  userRepository: {
    findByEmail: mocks.userFindByEmail,
    create: mocks.userCreate,
    getCart: mocks.getCart,
    saveCart: mocks.saveCart,
  },
  orderRepository: {
    create: mocks.orderCreate,
    findAll: mocks.orderFindAll,
    findByUser: mocks.orderFindByUser,
    markPaid: mocks.markPaid,
    updateStatus: mocks.updateStatus,
    remove: mocks.orderRemove,
  },
}))

vi.mock('stripe', () => ({
  default: class Stripe {
    constructor() {
      this.checkout = { sessions: { create: mocks.stripeCreate } }
    }
  },
}))

import app from '../../src/app.js'

const userToken = () => jwt.sign({ id: 'user-1' }, 'integration-secret')

const adminToken = () =>
  jwt.sign('admin@example.comadmin-password', 'integration-secret')

const validOrder = {
  items: [
    {
      name: 'Empanadas',
      price: { M: 10 },
      size: 'M',
      quantity: 1,
    },
  ],
  amount: 10,
  address: { city: 'Quito' },
}

describe('Casos positivos, negativos y límite por endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  describe('POST /api/user/register', () => {
    it('registra correctamente con una contraseña de ocho caracteres', async () => {
      mocks.userFindByEmail.mockResolvedValue(null)
      mocks.userCreate.mockResolvedValue({ _id: 'user-1' })

      const response = await request(app).post('/api/user/register').send({
        name: 'Ana',
        email: 'ana@example.com',
        password: '12345678',
      })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(jwt.verify(response.body.token, 'integration-secret')).toMatchObject(
        { id: 'user-1' }
      )
    })

    it('rechaza un correo con formato inválido', async () => {
      mocks.userFindByEmail.mockResolvedValue(null)

      const response = await request(app).post('/api/user/register').send({
        name: 'Ana',
        email: 'correo-invalido',
        password: '12345678',
      })

      expect(response.body).toEqual({
        success: false,
        message: 'Por favor ingrese un correo electrónico válido',
      })
      expect(mocks.userCreate).not.toHaveBeenCalled()
    })

    it('rechaza una contraseña de siete caracteres', async () => {
      mocks.userFindByEmail.mockResolvedValue(null)

      const response = await request(app).post('/api/user/register').send({
        name: 'Ana',
        email: 'ana@example.com',
        password: '1234567',
      })

      expect(response.body).toEqual({
        success: false,
        message: 'Por favor ingrese una contraseña segura',
      })
      expect(mocks.userCreate).not.toHaveBeenCalled()
    })
  })

  describe('POST /api/user/login', () => {
    it('inicia sesión con credenciales válidas', async () => {
      mocks.userFindByEmail.mockResolvedValue({
        _id: 'user-1',
        password: await bcrypt.hash('password-123', 4),
      })

      const response = await request(app).post('/api/user/login').send({
        email: 'ana@example.com',
        password: 'password-123',
      })

      expect(response.body.success).toBe(true)
      expect(jwt.verify(response.body.token, 'integration-secret')).toMatchObject(
        { id: 'user-1' }
      )
    })

    it('rechaza un usuario inexistente', async () => {
      mocks.userFindByEmail.mockResolvedValue(null)

      const response = await request(app).post('/api/user/login').send({
        email: 'missing@example.com',
        password: 'password-123',
      })

      expect(response.body).toEqual({
        success: false,
        message: 'El usuario no existe',
      })
    })

    it('rechaza una contraseña incorrecta', async () => {
      mocks.userFindByEmail.mockResolvedValue({
        _id: 'user-1',
        password: await bcrypt.hash('password-123', 4),
      })

      const response = await request(app).post('/api/user/login').send({
        email: 'ana@example.com',
        password: 'wrong-password',
      })

      expect(response.body).toEqual({
        success: false,
        message: 'Credenciales inválidas',
      })
    })
  })

  describe('POST /api/user/admin', () => {
    it('emite un token para las credenciales de administrador', async () => {
      const response = await request(app).post('/api/user/admin').send({
        email: 'admin@example.com',
        password: 'admin-password',
      })

      expect(response.body.success).toBe(true)
      expect(jwt.verify(response.body.token, 'integration-secret')).toBe(
        'admin@example.comadmin-password'
      )
    })

    it('rechaza credenciales de administrador incorrectas', async () => {
      const response = await request(app).post('/api/user/admin').send({
        email: 'admin@example.com',
        password: 'incorrecta',
      })

      expect(response.body).toEqual({
        success: false,
        message: 'Credenciales inválidas',
      })
    })

    it('rechaza credenciales vacías como valor límite', async () => {
      const response = await request(app).post('/api/user/admin').send({})

      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/product/add', () => {
    it('crea un producto con los datos requeridos', async () => {
      mocks.productCreate.mockResolvedValue({ _id: 'product-1' })

      const response = await request(app)
        .post('/api/product/add')
        .set('token', adminToken())
        .field('name', 'Empanadas')
        .field('description', 'Rellenas')
        .field('category', 'Snacks')
        .field('prices', JSON.stringify([{ size: 'M', price: 10 }]))
        .field('popular', 'true')

      expect(response.body).toMatchObject({
        success: true,
        message: 'Comida agregada',
        product: { _id: 'product-1' },
      })
      expect(mocks.productCreate).toHaveBeenCalledWith(
        expect.objectContaining({ price: { M: 10 }, sizes: ['M'] })
      )
    })

    it('rechaza la solicitud sin autorización administrativa', async () => {
      const response = await request(app).post('/api/product/add')

      expect(response.body.success).toBe(false)
      expect(mocks.productCreate).not.toHaveBeenCalled()
    })

    it('acepta precios cero y una lista de precios vacía como límites', async () => {
      mocks.productCreate.mockResolvedValue({ _id: 'product-1' })

      const zeroPriceResponse = await request(app)
        .post('/api/product/add')
        .set('token', adminToken())
        .field('name', 'Gratis')
        .field('description', 'Sin costo')
        .field('category', 'Snacks')
        .field('prices', JSON.stringify([{ size: 'S', price: 0 }]))

      expect(zeroPriceResponse.body.success).toBe(true)
      expect(mocks.productCreate).toHaveBeenCalledWith(
        expect.objectContaining({ price: { S: 0 }, sizes: ['S'] })
      )

      const emptyPricesResponse = await request(app)
        .post('/api/product/add')
        .set('token', adminToken())
        .field('prices', '[]')

      expect(emptyPricesResponse.body.success).toBe(true)
      expect(mocks.productCreate).toHaveBeenLastCalledWith(
        expect.objectContaining({ price: {}, sizes: [] })
      )
    })

    it('responde con error ante JSON de precios malformado', async () => {
      const response = await request(app)
        .post('/api/product/add')
        .set('token', adminToken())
        .field('prices', '{')

      expect(response.status).toBe(500)
      expect(response.body.success).toBe(false)
      expect(mocks.productCreate).not.toHaveBeenCalled()
    })
  })

  describe('POST /api/product/remove', () => {
    it('elimina el producto indicado', async () => {
      const response = await request(app)
        .post('/api/product/remove')
        .set('token', adminToken())
        .send({ id: 'product-1' })

      expect(response.body.success).toBe(true)
      expect(mocks.productRemove).toHaveBeenCalledWith('product-1')
    })

    it('rechaza la solicitud sin token de administrador', async () => {
      const response = await request(app)
        .post('/api/product/remove')
        .send({ id: 'product-1' })

      expect(response.body.success).toBe(false)
      expect(mocks.productRemove).not.toHaveBeenCalled()
    })

    it('pasa un identificador ausente al servicio como límite de entrada', async () => {
      const response = await request(app)
        .post('/api/product/remove')
        .set('token', adminToken())
        .send({})

      expect(response.body.success).toBe(true)
      expect(mocks.productRemove).toHaveBeenCalledWith(undefined)
    })
  })

  describe('POST /api/product/single', () => {
    it('devuelve el producto encontrado', async () => {
      mocks.productFindById.mockResolvedValue({ _id: 'product-1' })

      const response = await request(app)
        .post('/api/product/single')
        .send({ productId: 'product-1' })

      expect(response.body).toEqual({
        success: true,
        product: { _id: 'product-1' },
      })
    })

    it('devuelve null si el identificador no corresponde a un producto', async () => {
      mocks.productFindById.mockResolvedValue(null)

      const response = await request(app)
        .post('/api/product/single')
        .send({ productId: 'not-found' })

      expect(response.body).toEqual({ success: true, product: null })
    })

    it('maneja un identificador vacío como límite de entrada', async () => {
      mocks.productFindById.mockResolvedValue(null)

      const response = await request(app)
        .post('/api/product/single')
        .send({ productId: '' })

      expect(response.body).toEqual({ success: true, product: null })
      expect(mocks.productFindById).toHaveBeenCalledWith('')
    })
  })

  describe('GET /api/product/list', () => {
    it('devuelve la lista de productos', async () => {
      mocks.productFindAll.mockResolvedValue([{ _id: 'product-1' }])

      const response = await request(app).get('/api/product/list')

      expect(response.body).toEqual({
        success: true,
        products: [{ _id: 'product-1' }],
      })
    })

    it('devuelve una lista vacía cuando no hay productos', async () => {
      mocks.productFindAll.mockResolvedValue([])

      const response = await request(app).get('/api/product/list')

      expect(response.body).toEqual({ success: true, products: [] })
    })

    it('expone el error del repositorio con estado 500', async () => {
      mocks.productFindAll.mockRejectedValue(new Error('fallo de consulta'))

      const response = await request(app).get('/api/product/list')

      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        success: false,
        message: 'fallo de consulta',
      })
    })
  })

  describe('POST /api/cart/add', () => {
    it('agrega una unidad a un carrito vacío', async () => {
      mocks.getCart.mockResolvedValue({})

      const response = await request(app)
        .post('/api/cart/add')
        .set('token', userToken())
        .send({ itemId: 'product-1', size: 'M' })

      expect(response.body.success).toBe(true)
      expect(mocks.saveCart).toHaveBeenCalledWith('user-1', {
        'product-1': { M: 1 },
      })
    })

    it('rechaza la operación sin token de usuario', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .send({ itemId: 'product-1', size: 'M' })

      expect(response.body.success).toBe(false)
      expect(mocks.getCart).not.toHaveBeenCalled()
    })

    it('incrementa una talla existente al agregarla otra vez', async () => {
      mocks.getCart.mockResolvedValue({ 'product-1': { M: 1 } })

      const response = await request(app)
        .post('/api/cart/add')
        .set('token', userToken())
        .send({ itemId: 'product-1', size: 'M' })

      expect(response.body.success).toBe(true)
      expect(mocks.saveCart).toHaveBeenCalledWith('user-1', {
        'product-1': { M: 2 },
      })
    })
  })

  describe('POST /api/cart/update', () => {
    it('establece la cantidad solicitada', async () => {
      mocks.getCart.mockResolvedValue({ 'product-1': { M: 1 } })

      const response = await request(app)
        .post('/api/cart/update')
        .set('token', userToken())
        .send({ itemId: 'product-1', size: 'M', quantity: 3 })

      expect(response.body.success).toBe(true)
      expect(mocks.saveCart).toHaveBeenCalledWith('user-1', {
        'product-1': { M: 3 },
      })
    })

    it('rechaza la operación sin token de usuario', async () => {
      const response = await request(app)
        .post('/api/cart/update')
        .send({ itemId: 'product-1', size: 'M', quantity: 1 })

      expect(response.body.success).toBe(false)
      expect(mocks.getCart).not.toHaveBeenCalled()
    })

    it('permite establecer la cantidad límite de cero', async () => {
      mocks.getCart.mockResolvedValue({ 'product-1': { M: 1 } })

      const response = await request(app)
        .post('/api/cart/update')
        .set('token', userToken())
        .send({ itemId: 'product-1', size: 'M', quantity: 0 })

      expect(response.body.success).toBe(true)
      expect(mocks.saveCart).toHaveBeenCalledWith('user-1', {
        'product-1': { M: 0 },
      })
    })
  })

  describe('POST /api/cart/get', () => {
    it('devuelve el carrito del usuario autenticado', async () => {
      mocks.getCart.mockResolvedValue({ 'product-1': { M: 2 } })

      const response = await request(app)
        .post('/api/cart/get')
        .set('token', userToken())

      expect(response.body).toEqual({
        success: true,
        cartData: { 'product-1': { M: 2 } },
      })
    })

    it('rechaza la consulta sin token', async () => {
      const response = await request(app).post('/api/cart/get')

      expect(response.body.success).toBe(false)
      expect(mocks.getCart).not.toHaveBeenCalled()
    })

    it('devuelve el carrito vacío como límite normal', async () => {
      mocks.getCart.mockResolvedValue({})

      const response = await request(app)
        .post('/api/cart/get')
        .set('token', userToken())

      expect(response.body).toEqual({ success: true, cartData: {} })
    })
  })

  describe('POST /api/order/place', () => {
    it('crea una orden contra entrega y vacía el carrito', async () => {
      mocks.orderCreate.mockResolvedValue({ _id: 'order-1' })

      const response = await request(app)
        .post('/api/order/place')
        .set('token', userToken())
        .send(validOrder)

      expect(response.body.success).toBe(true)
      expect(mocks.orderCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          items: validOrder.items,
          amount: 10,
          paymentMethod: 'COD',
          payment: false,
        })
      )
      expect(mocks.saveCart).toHaveBeenCalledWith('user-1', {})
    })

    it('rechaza la creación de orden sin autenticación', async () => {
      const response = await request(app)
        .post('/api/order/place')
        .send(validOrder)

      expect(response.body.success).toBe(false)
      expect(mocks.orderCreate).not.toHaveBeenCalled()
    })

    it('acepta una orden vacía con importe cero como caso límite actual', async () => {
      mocks.orderCreate.mockResolvedValue({ _id: 'order-empty' })

      const response = await request(app)
        .post('/api/order/place')
        .set('token', userToken())
        .send({ items: [], amount: 0, address: {} })

      expect(response.body.success).toBe(true)
      expect(mocks.orderCreate).toHaveBeenCalledWith(
        expect.objectContaining({ items: [], amount: 0 })
      )
      expect(mocks.saveCart).toHaveBeenCalledWith('user-1', {})
    })
  })

  describe('POST /api/order/stripe', () => {
    it('inicia una sesión de Stripe y devuelve su URL', async () => {
      mocks.orderCreate.mockResolvedValue({ _id: 'order-1' })
      mocks.stripeCreate.mockResolvedValue({ url: 'https://stripe.test/pay' })

      const response = await request(app)
        .post('/api/order/stripe')
        .set('token', userToken())
        .set('origin', 'https://foodie.test')
        .send(validOrder)

      expect(response.body).toEqual({
        success: true,
        session_url: 'https://stripe.test/pay',
        message: 'Orden colocada',
      })
      expect(mocks.stripeCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url:
            'https://foodie.test/verify?success=true&orderId=order-1',
          cancel_url:
            'https://foodie.test/verify?success=false&orderId=order-1',
          mode: 'payment',
        })
      )
    })

    it('rechaza la solicitud sin autenticación', async () => {
      const response = await request(app)
        .post('/api/order/stripe')
        .send(validOrder)

      expect(response.body.success).toBe(false)
      expect(mocks.stripeCreate).not.toHaveBeenCalled()
    })

    it('crea sesión para una orden vacía con solo el cargo de entrega', async () => {
      mocks.orderCreate.mockResolvedValue({ _id: 'order-empty' })
      mocks.stripeCreate.mockResolvedValue({ url: 'https://stripe.test/pay' })

      const response = await request(app)
        .post('/api/order/stripe')
        .set('token', userToken())
        .set('origin', 'https://foodie.test')
        .send({ items: [], amount: 0, address: {} })

      expect(response.body.success).toBe(true)
      expect(mocks.stripeCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [
            expect.objectContaining({
              price_data: expect.objectContaining({
                product_data: { name: 'Delivery_Charges' },
              }),
            }),
          ],
        })
      )
    })

    it('devuelve fallo si Stripe no puede crear la sesión', async () => {
      mocks.orderCreate.mockResolvedValue({ _id: 'order-1' })
      mocks.stripeCreate.mockRejectedValue(new Error('Stripe no disponible'))

      const response = await request(app)
        .post('/api/order/stripe')
        .set('token', userToken())
        .set('origin', 'https://foodie.test')
        .send(validOrder)

      expect(response.body).toEqual({
        success: false,
        message: 'Stripe no disponible',
      })
    })
  })

  describe('POST /api/order/verifyStripe', () => {
    it('confirma un pago exitoso y vacía el carrito', async () => {
      const response = await request(app)
        .post('/api/order/verifyStripe')
        .set('token', userToken())
        .send({ orderId: 'order-1', success: 'true' })

      expect(response.body).toEqual({ success: true })
      expect(mocks.markPaid).toHaveBeenCalledWith('order-1')
      expect(mocks.saveCart).toHaveBeenCalledWith('user-1', {})
    })

    it('elimina la orden cuando el pago fue cancelado', async () => {
      const response = await request(app)
        .post('/api/order/verifyStripe')
        .set('token', userToken())
        .send({ orderId: 'order-1', success: 'false' })

      expect(response.body).toEqual({ success: false })
      expect(mocks.orderRemove).toHaveBeenCalledWith('order-1')
      expect(mocks.markPaid).not.toHaveBeenCalled()
    })

    it('trata un indicador distinto a true como pago no exitoso', async () => {
      const response = await request(app)
        .post('/api/order/verifyStripe')
        .set('token', userToken())
        .send({ orderId: 'order-1', success: '' })

      expect(response.body).toEqual({ success: false })
      expect(mocks.orderRemove).toHaveBeenCalledWith('order-1')
    })
  })

  describe('POST /api/order/userOrders', () => {
    it('lista las órdenes del usuario autenticado', async () => {
      mocks.orderFindByUser.mockResolvedValue([{ _id: 'order-1' }])

      const response = await request(app)
        .post('/api/order/userOrders')
        .set('token', userToken())
        .send({ userId: 'otro-usuario' })

      expect(response.body).toEqual({
        success: true,
        orders: [{ _id: 'order-1' }],
      })
      expect(mocks.orderFindByUser).toHaveBeenCalledWith('user-1')
    })

    it('rechaza la consulta sin autenticación', async () => {
      const response = await request(app).post('/api/order/userOrders')

      expect(response.body.success).toBe(false)
      expect(mocks.orderFindByUser).not.toHaveBeenCalled()
    })

    it('devuelve una lista vacía cuando no hay órdenes', async () => {
      mocks.orderFindByUser.mockResolvedValue([])

      const response = await request(app)
        .post('/api/order/userOrders')
        .set('token', userToken())

      expect(response.body).toEqual({ success: true, orders: [] })
    })
  })

  describe('POST /api/order/list', () => {
    it('lista todas las órdenes para el administrador', async () => {
      mocks.orderFindAll.mockResolvedValue([{ _id: 'order-1' }])

      const response = await request(app)
        .post('/api/order/list')
        .set('token', adminToken())

      expect(response.body).toEqual({
        success: true,
        orders: [{ _id: 'order-1' }],
      })
    })

    it('rechaza un token de usuario normal', async () => {
      const response = await request(app)
        .post('/api/order/list')
        .set('token', userToken())

      expect(response.body.success).toBe(false)
      expect(mocks.orderFindAll).not.toHaveBeenCalled()
    })

    it('devuelve cero órdenes como resultado límite', async () => {
      mocks.orderFindAll.mockResolvedValue([])

      const response = await request(app)
        .post('/api/order/list')
        .set('token', adminToken())

      expect(response.body).toEqual({ success: true, orders: [] })
    })
  })

  describe('POST /api/order/status', () => {
    it('actualiza el estado de una orden', async () => {
      const response = await request(app)
        .post('/api/order/status')
        .set('token', adminToken())
        .send({ orderId: 'order-1', status: 'En camino' })

      expect(response.body).toEqual({
        success: true,
        message: 'Estado actualizado',
      })
      expect(mocks.updateStatus).toHaveBeenCalledWith('order-1', 'En camino')
    })

    it('rechaza la actualización sin autorización administrativa', async () => {
      const response = await request(app)
        .post('/api/order/status')
        .send({ orderId: 'order-1', status: 'En camino' })

      expect(response.body.success).toBe(false)
      expect(mocks.updateStatus).not.toHaveBeenCalled()
    })

    it('pasa el estado vacío al servicio como valor límite', async () => {
      const response = await request(app)
        .post('/api/order/status')
        .set('token', adminToken())
        .send({ orderId: 'order-1', status: '' })

      expect(response.body.success).toBe(true)
      expect(mocks.updateStatus).toHaveBeenCalledWith('order-1', '')
    })
  })
})
