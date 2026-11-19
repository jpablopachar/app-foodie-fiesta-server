import { beforeEach, describe, expect, it, vi } from 'vitest'
import jwt from 'jsonwebtoken'
import request from 'supertest'

const mocks = vi.hoisted(() => ({
  findAll: vi.fn(),
  remove: vi.fn(),
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
    remove: mocks.remove,
    findAll: mocks.findAll,
    findById: vi.fn(),
  },
  userRepository: {
    findByEmail: vi.fn(),
    create: vi.fn(),
    getCart: vi.fn(),
    saveCart: vi.fn(),
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

describe('Integración de productos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devuelve los productos obtenidos por el servicio y el repositorio', async () => {
    const products = [{ _id: 'product-1', name: 'Empanadas' }]
    mocks.findAll.mockResolvedValue(products)

    const response = await request(app).get('/api/product/list')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ success: true, products })
    expect(mocks.findAll).toHaveBeenCalledOnce()
  })

  it('autoriza al administrador antes de eliminar un producto', async () => {
    const token = jwt.sign(
      'admin@example.comadmin-password',
      'integration-secret'
    )

    const response = await request(app)
      .post('/api/product/remove')
      .set('token', token)
      .send({ id: 'product-1' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      message: 'Comida eliminada',
    })
    expect(mocks.remove).toHaveBeenCalledWith('product-1')
  })
})
