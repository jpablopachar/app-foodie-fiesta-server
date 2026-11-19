import { beforeEach, describe, expect, it, vi } from 'vitest'
import jwt from 'jsonwebtoken'
import authUser from '../../../src/middlewares/auth.js'

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}))

vi.mock('../../../src/configs/index.js', () => ({
  env: {
    jwtSecret: 'test-secret',
  },
}))

describe('authUser', () => {
  let req
  let res
  let next

  beforeEach(() => {
    req = {
      headers: {},
      body: {},
    }
    res = {
      json: vi.fn(),
    }
    next = vi.fn()
  })

  it('responde con error cuando no se proporciona un token', async () => {
    // Act
    await authUser(req, res, next)

    // Assert
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No autorizado, por favor inicie sesión',
    })
    expect(next).not.toHaveBeenCalled()
    expect(jwt.verify).not.toHaveBeenCalled()
  })

  it('agrega el identificador del usuario y continúa cuando el token es válido', async () => {
    // Arrange
    req.headers.token = 'valid-token'
    jwt.verify.mockReturnValue({ id: 'user-123' })

    // Act
    await authUser(req, res, next)

    // Assert
    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret')
    expect(req.body.userId).toBe('user-123')
    expect(next).toHaveBeenCalledOnce()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('responde con error cuando el token es inválido', async () => {
    // Arrange
    req.headers.token = 'invalid-token'
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token')
    })
    vi.spyOn(console, 'log').mockImplementation(() => {})

    // Act
    await authUser(req, res, next)

    // Assert
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token inválido o expirado',
    })
    expect(next).not.toHaveBeenCalled()
  })
})