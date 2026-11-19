import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  register: vi.fn(),
  login: vi.fn(),
  adminLogin: vi.fn(),
}))

vi.mock('../../../src/controllers/index.js', () => ({
  userController: {
    registerUser: mocks.register,
    loginUser: mocks.login,
    adminLogin: mocks.adminLogin,
  },
}))

import router from '../../../src/routes/user.js'

describe('userRouter', () => {
  it('registra las rutas de autenticación sin middleware adicional', () => {
    expect(
      router.stack.map(({ route }) => ({
        path: route.path,
        method: Object.keys(route.methods)[0],
        handlers: route.stack.map(({ handle }) => handle),
      }))
    ).toEqual([
      { path: '/register', method: 'post', handlers: [mocks.register] },
      { path: '/login', method: 'post', handlers: [mocks.login] },
      { path: '/admin', method: 'post', handlers: [mocks.adminLogin] },
    ])
  })
})
