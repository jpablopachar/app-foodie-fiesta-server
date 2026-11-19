import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  add: vi.fn(),
  update: vi.fn(),
  get: vi.fn(),
}))

vi.mock('../../../src/services/index.js', () => ({
  cartService: { add: mocks.add, update: mocks.update, get: mocks.get },
}))

import { cartController } from '../../../src/controllers/cart.js'

const response = () => ({ json: vi.fn() })

describe('cartController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('responde al agregar, actualizar y consultar el carrito', async () => {
    const req = { body: { userId: 'user-1', itemId: 'item-1', size: 'M' } }
    const res = response()
    mocks.get.mockResolvedValueOnce({ item: { M: 1 } })

    await cartController.addToCart(req, res)
    expect(mocks.add).toHaveBeenCalledWith(req.body)
    expect(res.json).toHaveBeenLastCalledWith({
      success: true,
      message: 'Agregado al carrito',
    })

    await cartController.updateCart(req, res)
    expect(mocks.update).toHaveBeenCalledWith(req.body)

    await cartController.getUserCart(req, res)
    expect(mocks.get).toHaveBeenCalledWith('user-1')
    expect(res.json).toHaveBeenLastCalledWith({
      success: true,
      cartData: { item: { M: 1 } },
    })
  })

  it('traduce errores del servicio a una respuesta fallida', async () => {
    mocks.add.mockRejectedValueOnce(new Error('cart failed'))
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const res = response()

    await cartController.addToCart({ body: {} }, res)

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'cart failed',
    })
  })

  it('responde con error al fallar la actualización o consulta', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})

    for (const [handler, service] of [
      [cartController.updateCart, mocks.update],
      [cartController.getUserCart, mocks.get],
    ]) {
      service.mockRejectedValueOnce(new Error('cart failed'))
      const res = response()

      await handler({ body: {} }, res)

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'cart failed',
      })
    }
  })
})
