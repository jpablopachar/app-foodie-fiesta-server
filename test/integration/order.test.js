import { beforeEach, describe, expect, it, vi } from 'vitest'
import jwt from 'jsonwebtoken'
import request from 'supertest'

const mocks = vi.hoisted(() => ({
  createOrder: vi.fn(),
  saveCart: vi.fn(),
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
    create: vi.fn(),
    remove: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
  },
  userRepository: {
    findByEmail: vi.fn(),
    create: vi.fn(),
    getCart: vi.fn(),
    saveCart: mocks.saveCart,
  },
  orderRepository: {
    create: mocks.createOrder,
    findAll: vi.fn(),
    findByUser: vi.fn(),
    markPaid: vi.fn(),
    updateStatus: vi.fn(),
    remove: vi.fn(),
  },
}))

import app from '../../src/app.js'

describe('Integración de órdenes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('autentica la solicitud, crea la orden contra entrega y vacía el carrito', async () => {
    mocks.createOrder.mockResolvedValue({ _id: 'order-1' })
    const token = jwt.sign({ id: 'user-1' }, 'integration-secret')
    const order = {
      items: [{ name: 'Empanadas', quantity: 2 }],
      amount: 20,
      address: { city: 'Bogotá' },
    }

    const response = await request(app)
      .post('/api/order/place')
      .set('token', token)
      .send(order)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      message: 'Orden colocada',
    })
    expect(mocks.createOrder).toHaveBeenCalledWith({
      ...order,
      userId: 'user-1',
      paymentMethod: 'COD',
      payment: false,
      date: expect.any(Number),
    })
    expect(mocks.saveCart).toHaveBeenCalledWith('user-1', {})
  })
})
