import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  authUser: vi.fn(),
  add: vi.fn(),
  update: vi.fn(),
  get: vi.fn(),
}))

vi.mock('../../../src/middlewares/index.js', () => ({
  authUser: mocks.authUser,
}))

vi.mock('../../../src/controllers/index.js', () => ({
  cartController: {
    addToCart: mocks.add,
    updateCart: mocks.update,
    getUserCart: mocks.get,
  },
}))

import router from '../../../src/routes/cart.js'

describe('cartRouter', () => {
  it('requiere autenticación para todas las operaciones del carrito', () => {
    expect(
      router.stack.map(({ route }) => ({
        path: route.path,
        method: Object.keys(route.methods)[0],
        handlers: route.stack.map(({ handle }) => handle),
      }))
    ).toEqual([
      { path: '/add', method: 'post', handlers: [mocks.authUser, mocks.add] },
      {
        path: '/update',
        method: 'post',
        handlers: [mocks.authUser, mocks.update],
      },
      { path: '/get', method: 'post', handlers: [mocks.authUser, mocks.get] },
    ])
  })
})
