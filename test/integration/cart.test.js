import { beforeEach, describe, expect, it, vi } from 'vitest'
import jwt from 'jsonwebtoken'
import request from 'supertest'

const mocks = vi.hoisted(() => ({
  getCart: vi.fn(),
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
    getCart: mocks.getCart,
    saveCart: mocks.saveCart,
  },
  orderRepository: {
    create: vi.fn(),
    findAll: vi.fn(),
    findByUser: vi.fn(),
    markPaid: vi.fn(),
    updateStatus: vi.fn(),
    remove: vi.fn(),
  },
}))

import app from '../../src/app.js'

describe('Integración del carrito', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('autentica al usuario y persiste el producto añadido al carrito', async () => {
    mocks.getCart.mockResolvedValue({})
    const token = jwt.sign({ id: 'user-1' }, 'integration-secret')

    const response = await request(app)
      .post('/api/cart/add')
      .set('token', token)
      .send({ itemId: 'product-1', size: 'M' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      message: 'Agregado al carrito',
    })
    expect(mocks.getCart).toHaveBeenCalledWith('user-1')
    expect(mocks.saveCart).toHaveBeenCalledWith('user-1', {
      'product-1': { M: 1 },
    })
  })

  it('rechaza la solicitud sin token antes de acceder al carrito', async () => {
    const response = await request(app)
      .post('/api/cart/add')
      .send({ itemId: 'product-1', size: 'M' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: false,
      message: 'No autorizado, por favor inicie sesión',
    })
    expect(mocks.getCart).not.toHaveBeenCalled()
    expect(mocks.saveCart).not.toHaveBeenCalled()
  })
})
