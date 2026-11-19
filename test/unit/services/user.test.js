import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findByEmail: vi.fn(),
  create: vi.fn(),
  genSalt: vi.fn(),
  hash: vi.fn(),
  compare: vi.fn(),
  isEmail: vi.fn(),
  sign: vi.fn(),
}))

vi.mock('../../../src/repositories/index.js', () => ({
  userRepository: {
    findByEmail: mocks.findByEmail,
    create: mocks.create,
  },
}))

vi.mock('../../../src/configs/index.js', () => ({
  env: {
    jwtSecret: 'test-secret',
    adminEmail: 'admin@example.com',
    adminPass: 'admin-password',
  },
}))

vi.mock('bcrypt', () => ({
  compare: mocks.compare,
  genSalt: mocks.genSalt,
  hash: mocks.hash,
}))

vi.mock('validator', () => ({
  default: { isEmail: mocks.isEmail },
}))

vi.mock('jsonwebtoken', () => ({
  default: { sign: mocks.sign },
}))

import { userService } from '../../../src/services/user.js'

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.isEmail.mockReturnValue(true)
    mocks.genSalt.mockResolvedValue('salt')
    mocks.hash.mockResolvedValue('hashed-password')
    mocks.sign.mockReturnValue('signed-token')
  })

  it('rechaza registro duplicado, correo inválido y contraseña corta', async () => {
    mocks.findByEmail.mockResolvedValueOnce({ _id: 'existing' })
    await expect(
      userService.register({
        name: 'A',
        email: 'a@example.com',
        password: 'long-password',
      })
    ).resolves.toEqual({ message: 'El usuario ya existe' })

    mocks.findByEmail.mockResolvedValueOnce(null)
    mocks.isEmail.mockReturnValueOnce(false)
    await expect(
      userService.register({
        name: 'A',
        email: 'bad',
        password: 'long-password',
      })
    ).resolves.toEqual({
      message: 'Por favor ingrese un correo electrónico válido',
    })

    mocks.findByEmail.mockResolvedValueOnce(null)
    mocks.isEmail.mockReturnValueOnce(true)
    await expect(
      userService.register({
        name: 'A',
        email: 'a@example.com',
        password: 'short',
      })
    ).resolves.toEqual({ message: 'Por favor ingrese una contraseña segura' })
    expect(mocks.create).not.toHaveBeenCalled()
  })

  it('cifra la contraseña y firma un token durante el registro', async () => {
    mocks.findByEmail.mockResolvedValue(null)
    mocks.create.mockResolvedValue({ _id: 'user-1' })

    await expect(
      userService.register({
        name: 'A',
        email: 'a@example.com',
        password: 'long-password',
      })
    ).resolves.toEqual({ token: 'signed-token' })

    expect(mocks.genSalt).toHaveBeenCalledWith(10)
    expect(mocks.hash).toHaveBeenCalledWith('long-password', 'salt')
    expect(mocks.create).toHaveBeenCalledWith({
      name: 'A',
      email: 'a@example.com',
      password: 'hashed-password',
    })
    expect(mocks.sign).toHaveBeenCalledWith({ id: 'user-1' }, 'test-secret')
  })

  it('maneja errores de login y emite token con credenciales correctas', async () => {
    mocks.findByEmail.mockResolvedValueOnce(null)
    await expect(
      userService.login({ email: 'missing@example.com', password: 'password' })
    ).resolves.toEqual({ message: 'El usuario no existe' })

    mocks.findByEmail.mockResolvedValueOnce({
      _id: 'user-1',
      password: 'hashed-password',
    })
    mocks.compare.mockResolvedValueOnce(false)
    await expect(
      userService.login({ email: 'a@example.com', password: 'wrong' })
    ).resolves.toEqual({ message: 'Credenciales inválidas' })

    mocks.findByEmail.mockResolvedValueOnce({
      _id: 'user-1',
      password: 'hashed-password',
    })
    mocks.compare.mockResolvedValueOnce(true)
    await expect(
      userService.login({ email: 'a@example.com', password: 'correct' })
    ).resolves.toEqual({ token: 'signed-token' })
  })

  it('valida las credenciales de administrador', () => {
    expect(
      userService.adminLogin({ email: 'wrong', password: 'wrong' })
    ).toEqual({ message: 'Credenciales inválidas' })
    expect(
      userService.adminLogin({
        email: 'admin@example.com',
        password: 'admin-password',
      })
    ).toEqual({ token: 'signed-token' })
    expect(mocks.sign).toHaveBeenCalledWith(
      'admin@example.comadmin-password',
      'test-secret'
    )
  })
})
