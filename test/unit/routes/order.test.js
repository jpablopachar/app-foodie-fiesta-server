import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  authAdmin: vi.fn(),
  authUser: vi.fn(),
  allOrders: vi.fn(),
  updateStatus: vi.fn(),
  placeOrder: vi.fn(),
  placeOrderStripe: vi.fn(),
  verifyStripe: vi.fn(),
  userOrders: vi.fn(),
}))

vi.mock('../../../src/middlewares/index.js', () => ({
  authAdmin: mocks.authAdmin,
  authUser: mocks.authUser,
}))

vi.mock('../../../src/controllers/index.js', () => ({
  orderController: {
    allOrders: mocks.allOrders,
    updateStatus: mocks.updateStatus,
    placeOrder: mocks.placeOrder,
    placeOrderStripe: mocks.placeOrderStripe,
    verifyStripe: mocks.verifyStripe,
    userOrders: mocks.userOrders,
  },
}))

import router from '../../../src/routes/order.js'

describe('orderRouter', () => {
  it('restringe las operaciones administrativas y las del usuario', () => {
    expect(
      router.stack.map(({ route }) => ({
        path: route.path,
        method: Object.keys(route.methods)[0],
        handlers: route.stack.map(({ handle }) => handle),
      }))
    ).toEqual([
      {
        path: '/list',
        method: 'post',
        handlers: [mocks.authAdmin, mocks.allOrders],
      },
      {
        path: '/status',
        method: 'post',
        handlers: [mocks.authAdmin, mocks.updateStatus],
      },
      {
        path: '/place',
        method: 'post',
        handlers: [mocks.authUser, mocks.placeOrder],
      },
      {
        path: '/stripe',
        method: 'post',
        handlers: [mocks.authUser, mocks.placeOrderStripe],
      },
      {
        path: '/verifyStripe',
        method: 'post',
        handlers: [mocks.authUser, mocks.verifyStripe],
      },
      {
        path: '/userOrders',
        method: 'post',
        handlers: [mocks.authUser, mocks.userOrders],
      },
    ])
  })
})
