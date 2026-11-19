import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  remove: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  upload: vi.fn(),
}))

vi.mock('../../../src/repositories/index.js', () => ({
  productRepository: {
    create: mocks.create,
    remove: mocks.remove,
    findAll: mocks.findAll,
    findById: mocks.findById,
  },
}))

vi.mock('cloudinary', () => ({
  v2: { uploader: { upload: mocks.upload } },
}))

import { productService } from '../../../src/services/product.js'

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('convierte precios y guarda un producto sin imagen subida', async () => {
    mocks.create.mockResolvedValue({ _id: 'product-1' })

    await productService.add({
      name: 'Dish',
      description: 'Description',
      category: 'Main',
      prices: JSON.stringify([
        { size: 'M', price: '12.5' },
        { size: 'L', price: '18' },
      ]),
      popular: 'true',
    })

    const data = mocks.create.mock.calls[0][0]
    expect(data).toMatchObject({
      name: 'Dish',
      category: 'Main',
      price: { M: 12.5, L: 18 },
      popular: true,
      sizes: ['M', 'L'],
      image: 'https://via.placeholder.com/150',
    })
    expect(data.date).toEqual(expect.any(Number))
  })

  it('sube la imagen opcional y utiliza la URL devuelta', async () => {
    mocks.upload.mockResolvedValue({
      secure_url: 'https://cdn.example/dish.png',
    })
    mocks.create.mockResolvedValue({ _id: 'product-1' })

    await productService.add(
      {
        name: 'Dish',
        description: 'Description',
        category: 'Main',
        prices: JSON.stringify([{ size: 'S', price: '5' }]),
        popular: 'false',
      },
      'uploads/dish.png'
    )

    expect(mocks.upload).toHaveBeenCalledWith('uploads/dish.png', {
      resource_type: 'image',
    })
    expect(mocks.create.mock.calls[0][0]).toMatchObject({
      image: 'https://cdn.example/dish.png',
      popular: false,
    })
  })

  it('delega consulta y eliminación al repositorio', async () => {
    mocks.remove.mockResolvedValue(null)
    mocks.findAll.mockResolvedValue([])
    mocks.findById.mockResolvedValue({ _id: 'product-1' })

    await expect(productService.remove('product-1')).resolves.toBeNull()
    await expect(productService.list()).resolves.toEqual([])
    await expect(productService.get('product-1')).resolves.toEqual({
      _id: 'product-1',
    })
  })
})
