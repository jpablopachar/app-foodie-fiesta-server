import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getCart: vi.fn(),
  saveCart: vi.fn(),
}))

vi.mock('../../../src/repositories/index.js', () => ({
  userRepository: {
    getCart: mocks.getCart,
    saveCart: mocks.saveCart,
  },
}))

import { cartService } from '../../../src/services/cart.js'

describe('cartService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('incrementa una talla existente y persiste el carrito', async () => {
    const cart = { product: { M: 1 } }
    mocks.getCart.mockResolvedValue(cart)

    await cartService.add({ userId: 'user-1', itemId: 'product', size: 'M' })

    expect(cart.product.M).toBe(2)
    expect(mocks.saveCart).toHaveBeenCalledWith('user-1', cart)
  })

  it('agrega una talla o un producto que todavía no existe', async () => {
    const cart = { product: { M: 1 } }
    mocks.getCart.mockResolvedValueOnce(cart)
    await cartService.add({ userId: 'user-1', itemId: 'product', size: 'L' })
    expect(cart.product.L).toBe(1)

    const emptyCart = {}
    mocks.getCart.mockResolvedValueOnce(emptyCart)
    await cartService.add({
      userId: 'user-1',
      itemId: 'new-product',
      size: 'S',
    })
    expect(emptyCart['new-product']).toEqual({ S: 1 })
  })

  it('actualiza la cantidad y consulta el carrito', async () => {
    const cart = { product: { M: 1 } }
    mocks.getCart.mockResolvedValue(cart)

    await cartService.update({
      userId: 'user-1',
      itemId: 'product',
      size: 'M',
      quantity: 4,
    })
    expect(cart.product.M).toBe(4)
    expect(mocks.saveCart).toHaveBeenCalledWith('user-1', cart)
    await expect(cartService.get('user-1')).resolves.toBe(cart)
  })
})
