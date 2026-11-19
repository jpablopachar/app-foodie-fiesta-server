import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  findAll: vi.fn(),
  findByUser: vi.fn(),
  markPaid: vi.fn(),
  updateStatus: vi.fn(),
  remove: vi.fn(),
  saveCart: vi.fn(),
  stripeCreate: vi.fn(),
}))

vi.mock('../../../src/repositories/index.js', () => ({
  orderRepository: {
    create: mocks.create,
    findAll: mocks.findAll,
    findByUser: mocks.findByUser,
    markPaid: mocks.markPaid,
    updateStatus: mocks.updateStatus,
    remove: mocks.remove,
  },
  userRepository: { saveCart: mocks.saveCart },
}))

vi.mock('../../../src/configs/index.js', () => ({
  env: { stripeSecretKey: 'stripe-secret' },
}))

vi.mock('stripe', () => ({
  default: vi.fn(function () {
    this.checkout = { sessions: { create: mocks.stripeCreate } }
  }),
}))

import { orderService } from '../../../src/services/order.js'

describe('orderService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.create.mockResolvedValue({ _id: 'order-1' })
  })

  it('crea una orden contra entrega y limpia el carrito', async () => {
    const data = {
      userId: 'user-1',
      items: [{ name: 'Dish' }],
      amount: 20,
      address: { city: 'Test' },
    }

    await orderService.place(data)

    expect(mocks.create).toHaveBeenCalledWith({
      ...data,
      paymentMethod: 'COD',
      payment: false,
      date: expect.any(Number),
    })
    expect(mocks.saveCart).toHaveBeenCalledWith('user-1', {})
  })

  it('crea una sesión Stripe con artículos, entrega y URLs de retorno', async () => {
    mocks.stripeCreate.mockResolvedValue({
      url: 'https://stripe.example/session',
    })
    const data = {
      userId: 'user-1',
      items: [{ name: 'Dish', price: { M: 2 }, size: 'M', quantity: 3 }],
      amount: 6,
      address: { city: 'Test' },
    }

    await expect(
      orderService.placeStripe(data, 'https://shop.example')
    ).resolves.toBe('https://stripe.example/session')

    expect(mocks.stripeCreate).toHaveBeenCalledWith({
      success_url: 'https://shop.example/verify?success=true&orderId=order-1',
      cancel_url: 'https://shop.example/verify?success=false&orderId=order-1',
      line_items: [
        {
          price_data: {
            currency: 'pkr',
            product_data: { name: 'Dish' },
            unit_amount: 55400,
          },
          quantity: 3,
        },
        {
          price_data: {
            currency: 'pkr',
            product_data: { name: 'Delivery_Charges' },
            unit_amount: 277000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
    })
  })

  it('confirma pago limpiando el carrito y elimina la orden si falla', async () => {
    await expect(
      orderService.verifyStripe({
        orderId: 'order-1',
        success: 'true',
        userId: 'user-1',
      })
    ).resolves.toBe(true)
    expect(mocks.markPaid).toHaveBeenCalledWith('order-1')
    expect(mocks.saveCart).toHaveBeenCalledWith('user-1', {})

    await expect(
      orderService.verifyStripe({
        orderId: 'order-2',
        success: 'false',
        userId: 'user-1',
      })
    ).resolves.toBe(false)
    expect(mocks.remove).toHaveBeenCalledWith('order-2')
  })

  it('delega consultas y actualización al repositorio', async () => {
    mocks.findAll.mockResolvedValue([])
    mocks.findByUser.mockResolvedValue([])
    mocks.updateStatus.mockResolvedValue({ _id: 'order-1' })

    await expect(orderService.list()).resolves.toEqual([])
    await expect(orderService.listByUser('user-1')).resolves.toEqual([])
    await expect(
      orderService.updateStatus('order-1', 'Shipped')
    ).resolves.toEqual({ _id: 'order-1' })

    expect(mocks.findByUser).toHaveBeenCalledWith('user-1')
    expect(mocks.updateStatus).toHaveBeenCalledWith('order-1', 'Shipped')
  })
})
