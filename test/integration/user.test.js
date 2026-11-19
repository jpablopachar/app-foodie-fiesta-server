import { beforeEach, describe, expect, it, vi } from 'vitest'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import request from 'supertest'

const mocks = vi.hoisted(() => ({
  findByEmail: vi.fn(),
  create: vi.fn(),
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
    findByEmail: mocks.findByEmail,
    create: mocks.create,
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

describe('Integración de usuarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registra al usuario, cifra su contraseña y devuelve un token válido', async () => {
    mocks.findByEmail.mockResolvedValue(null)
    mocks.create.mockResolvedValue({ _id: 'user-1' })

    const response = await request(app).post('/api/user/register').send({
      name: 'Ana',
      email: 'ana@example.com',
      password: 'secure-password',
    })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(jwt.verify(response.body.token, 'integration-secret')).toEqual({
      id: 'user-1',
      iat: expect.any(Number),
    })
    expect(mocks.findByEmail).toHaveBeenCalledWith('ana@example.com')

    const [storedUser] = mocks.create.mock.calls[0]
    expect(storedUser).toMatchObject({
      name: 'Ana',
      email: 'ana@example.com',
    })
    await expect(
      bcrypt.compare('secure-password', storedUser.password)
    ).resolves.toBe(true)
  })
})
