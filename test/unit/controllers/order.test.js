import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  place: vi.fn(),
  placeStripe: vi.fn(),
  verifyStripe: vi.fn(),
  list: vi.fn(),
  listByUser: vi.fn(),
  updateStatus: vi.fn(),
}))

vi.mock('../../../src/services/index.js', () => ({
  orderService: {
    place: mocks.place,
    placeStripe: mocks.placeStripe,
    verifyStripe: mocks.verifyStripe,
    list: mocks.list,
    listByUser: mocks.listByUser,
    updateStatus: mocks.updateStatus,
  },
}))

import { orderController } from '../../../src/controllers/order.js'

describe('orderController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('delega las operaciones y forma sus respuestas HTTP', async () => {
    const req = {
      body: { userId: 'user-1', orderId: 'order-1', status: 'Shipped' },
      headers: { origin: 'https://shop.example' },
    }
    const res = { json: vi.fn() }
    mocks.placeStripe.mockResolvedValueOnce('https://stripe.example')
    mocks.verifyStripe.mockResolvedValueOnce(true)
    mocks.list.mockResolvedValueOnce([{ _id: 'order-1' }])
    mocks.listByUser.mockResolvedValueOnce([{ _id: 'order-1' }])

    await orderController.placeOrder(req, res)
    expect(mocks.place).toHaveBeenCalledWith(req.body)

    await orderController.placeOrderStripe(req, res)
    expect(mocks.placeStripe).toHaveBeenCalledWith(
      req.body,
      'https://shop.example'
    )
    expect(res.json).toHaveBeenLastCalledWith({
      success: true,
      session_url: 'https://stripe.example',
      message: 'Orden colocada',
    })

    await orderController.verifyStripe(req, res)
    expect(res.json).toHaveBeenLastCalledWith({ success: true })

    await orderController.allOrders(req, res)
    expect(res.json).toHaveBeenLastCalledWith({
      success: true,
      orders: [{ _id: 'order-1' }],
    })

    await orderController.userOrders(req, res)
    expect(mocks.listByUser).toHaveBeenCalledWith('user-1')

    await orderController.updateStatus(req, res)
    expect(mocks.updateStatus).toHaveBeenCalledWith('order-1', 'Shipped')
  })

  it('responde con error si falla una operación', async () => {
    mocks.place.mockRejectedValueOnce(new Error('order failed'))
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const res = { json: vi.fn() }

    await orderController.placeOrder({ body: {} }, res)

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'order failed',
    })
  })

  it('responde con error si falla pago, verificación, consulta o actualización', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})

    for (const [handler, service] of [
      [orderController.placeOrderStripe, mocks.placeStripe],
      [orderController.verifyStripe, mocks.verifyStripe],
      [orderController.allOrders, mocks.list],
      [orderController.userOrders, mocks.listByUser],
      [orderController.updateStatus, mocks.updateStatus],
    ]) {
      service.mockRejectedValueOnce(new Error('order failed'))
      const res = { json: vi.fn() }

      await handler({ body: {}, headers: {} }, res)

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'order failed',
      })
    }
  })
})
