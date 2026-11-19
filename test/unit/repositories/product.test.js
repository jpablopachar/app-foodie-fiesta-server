import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const state = {
    find: vi.fn(),
    findById: vi.fn(),
    findByIdAndDelete: vi.fn(),
    save: vi.fn(),
  }
  state.productModel = vi.fn(function (data) {
    this.data = data
    this.save = state.save
  })
  Object.assign(state.productModel, {
    find: state.find,
    findById: state.findById,
    findByIdAndDelete: state.findByIdAndDelete,
  })
  return state
})

vi.mock('../../../src/models/index.js', () => ({
  productModel: mocks.productModel,
}))

import { productRepository } from '../../../src/repositories/product.js'

describe('productRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('crea y consulta productos', async () => {
    const product = { _id: 'product-1' }
    mocks.save.mockResolvedValue(product)
    mocks.find.mockResolvedValue([product])
    mocks.findById.mockResolvedValue(product)

    await expect(productRepository.create({ name: 'Dish' })).resolves.toBe(
      product
    )
    await expect(productRepository.findAll()).resolves.toEqual([product])
    await expect(productRepository.findById('product-1')).resolves.toBe(product)

    expect(mocks.find).toHaveBeenCalledWith({})
    expect(mocks.findById).toHaveBeenCalledWith('product-1')
  })

  it('elimina productos por identificador', async () => {
    mocks.findByIdAndDelete.mockResolvedValue(null)

    await expect(productRepository.remove('product-1')).resolves.toBeNull()
    expect(mocks.findByIdAndDelete).toHaveBeenCalledWith('product-1')
  })
})
