import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  add: vi.fn(),
  remove: vi.fn(),
  list: vi.fn(),
  get: vi.fn(),
}))

vi.mock('../../../src/services/index.js', () => ({
  productService: {
    add: mocks.add,
    remove: mocks.remove,
    list: mocks.list,
    get: mocks.get,
  },
}))

import { productController } from '../../../src/controllers/product.js'

const response = () => ({
  json: vi.fn(),
  status: vi.fn(function () {
    return this
  }),
})

describe('productController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('delega agregar, eliminar, listar y consultar un producto', async () => {
    const req = {
      body: { id: 'product-1', productId: 'product-1' },
      file: { path: 'uploads/dish.png' },
    }
    const res = response()
    mocks.add.mockResolvedValueOnce({ _id: 'product-1' })
    mocks.list.mockResolvedValueOnce([{ _id: 'product-1' }])
    mocks.get.mockResolvedValueOnce({ _id: 'product-1' })

    await productController.addProduct(req, res)
    expect(mocks.add).toHaveBeenCalledWith(req.body, 'uploads/dish.png')
    expect(res.json).toHaveBeenLastCalledWith({
      success: true,
      message: 'Comida agregada',
      product: { _id: 'product-1' },
    })

    await productController.removeProduct(req, res)
    expect(mocks.remove).toHaveBeenCalledWith('product-1')

    await productController.listProduct(req, res)
    expect(res.json).toHaveBeenLastCalledWith({
      success: true,
      products: [{ _id: 'product-1' }],
    })

    await productController.singleProduct(req, res)
    expect(mocks.get).toHaveBeenCalledWith('product-1')
    expect(res.json).toHaveBeenLastCalledWith({
      success: true,
      product: { _id: 'product-1' },
    })
  })

  it('responde con estado 500 si el servicio falla', async () => {
    mocks.list.mockRejectedValueOnce(new Error('product failed'))
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const res = response()

    await productController.listProduct({ body: {} }, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'product failed',
    })
  })

  it('responde con estado 500 al fallar alta, eliminación o consulta individual', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})

    for (const [handler, service] of [
      [productController.addProduct, mocks.add],
      [productController.removeProduct, mocks.remove],
      [productController.singleProduct, mocks.get],
    ]) {
      service.mockRejectedValueOnce(new Error('product failed'))
      const res = response()

      await handler({ body: {} }, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'product failed',
      })
    }
  })
})
