import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const state = {
    find: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    save: vi.fn(),
  }
  state.orderModel = vi.fn(function (data) {
    this.data = data
    this.save = state.save
  })
  Object.assign(state.orderModel, {
    find: state.find,
    findByIdAndUpdate: state.findByIdAndUpdate,
    findByIdAndDelete: state.findByIdAndDelete,
  })
  return state
})

vi.mock('../../../src/models/index.js', () => ({
  orderModel: mocks.orderModel,
}))

import { orderRepository } from '../../../src/repositories/order.js'

describe('orderRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('crea órdenes y las consulta por estado o usuario', async () => {
    const order = { _id: 'order-1' }
    mocks.save.mockResolvedValue(order)
    mocks.find.mockResolvedValue([order])

    await expect(orderRepository.create({ amount: 10 })).resolves.toBe(order)
    await expect(orderRepository.findAll()).resolves.toEqual([order])
    await expect(orderRepository.findByUser('user-1')).resolves.toEqual([order])

    expect(mocks.find).toHaveBeenNthCalledWith(1, {})
    expect(mocks.find).toHaveBeenNthCalledWith(2, { userId: 'user-1' })
  })

  it('actualiza el pago y estado, y elimina órdenes', async () => {
    mocks.findByIdAndUpdate.mockResolvedValue({ _id: 'order-1' })
    mocks.findByIdAndDelete.mockResolvedValue(null)

    await orderRepository.markPaid('order-1')
    await orderRepository.updateStatus('order-1', 'Shipped')
    await expect(orderRepository.remove('order-1')).resolves.toBeNull()

    expect(mocks.findByIdAndUpdate).toHaveBeenNthCalledWith(1, 'order-1', {
      payment: true,
    })
    expect(mocks.findByIdAndUpdate).toHaveBeenNthCalledWith(2, 'order-1', {
      status: 'Shipped',
    })
    expect(mocks.findByIdAndDelete).toHaveBeenCalledWith('order-1')
  })
})
