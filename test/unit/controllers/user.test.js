import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  register: vi.fn(),
  login: vi.fn(),
  adminLogin: vi.fn(),
}))

vi.mock('../../../src/services/index.js', () => ({
  userService: {
    register: mocks.register,
    login: mocks.login,
    adminLogin: mocks.adminLogin,
  },
}))

import { userController } from '../../../src/controllers/user.js'

describe('userController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('representa éxitos y errores de credenciales en las respuestas', async () => {
    const req = { body: { email: 'a@example.com', password: 'password' } }
    const res = { json: vi.fn() }
    mocks.register.mockResolvedValueOnce({ token: 'user-token' })
    mocks.login.mockResolvedValueOnce({ message: 'Credenciales inválidas' })
    mocks.adminLogin.mockReturnValueOnce({ token: 'admin-token' })

    await userController.registerUser(req, res)
    expect(res.json).toHaveBeenLastCalledWith({
      success: true,
      token: 'user-token',
    })

    await userController.loginUser(req, res)
    expect(res.json).toHaveBeenLastCalledWith({
      success: false,
      message: 'Credenciales inválidas',
    })

    await userController.adminLogin(req, res)
    expect(mocks.adminLogin).toHaveBeenCalledWith(req.body)
    expect(res.json).toHaveBeenLastCalledWith({
      success: true,
      token: 'admin-token',
    })
  })

  it('responde con error si el servicio de autenticación falla', async () => {
    mocks.login.mockRejectedValueOnce(new Error('login failed'))
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const res = { json: vi.fn() }

    await userController.loginUser({ body: {} }, res)

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'login failed',
    })
  })

  it('captura los errores de registro y acceso administrativo', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})

    for (const [handler, service, rejectsAsync] of [
      [userController.registerUser, mocks.register, true],
      [userController.adminLogin, mocks.adminLogin, false],
    ]) {
      if (rejectsAsync) {
        service.mockRejectedValueOnce(new Error('authentication failed'))
      } else {
        service.mockImplementationOnce(() => {
          throw new Error('authentication failed')
        })
      }
      const res = { json: vi.fn() }

      await handler({ body: {} }, res)

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'authentication failed',
      })
    }
  })
})
