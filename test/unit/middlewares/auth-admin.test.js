import { beforeEach, describe, expect, it, vi } from 'vitest'
import jwt from 'jsonwebtoken'
import authAdmin from '../../../src/middlewares/auth-admin.js'

vi.mock('jsonwebtoken', () => ({
  default: { verify: vi.fn() },
}))

vi.mock('../../../src/configs/index.js', () => ({
  env: {
    jwtSecret: 'test-secret',
    adminEmail: 'admin@example.com',
    adminPass: 'password',
  },
}))

describe('authAdmin', () => {
  let req
  let res
  let next

  beforeEach(() => {
    req = { headers: {} }
    res = { json: vi.fn() }
    next = vi.fn()
  })

  it('rechaza solicitudes sin token', async () => {
    await authAdmin(req, res, next)

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not Authorized please login',
    })
    expect(jwt.verify).not.toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('continúa cuando el token contiene las credenciales de administrador', async () => {
    req.headers.token = 'valid-token'
    jwt.verify.mockReturnValue('admin@example.compassword')

    await authAdmin(req, res, next)

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret')
    expect(next).toHaveBeenCalledOnce()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('rechaza un token válido que no corresponde al administrador', async () => {
    req.headers.token = 'user-token'
    jwt.verify.mockReturnValue('another-user')

    await authAdmin(req, res, next)

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not Authorized please login',
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('responde con el error cuando la verificación del token falla', async () => {
    req.headers.token = 'invalid-token'
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token')
    })
    vi.spyOn(console, 'log').mockImplementation(() => {})

    await authAdmin(req, res, next)

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid token',
    })
    expect(next).not.toHaveBeenCalled()
  })
})
