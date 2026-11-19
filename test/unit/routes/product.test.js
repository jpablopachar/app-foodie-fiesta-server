import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const state = {
    authAdmin: vi.fn(),
    uploadHandler: vi.fn(),
    uploadField: undefined,
    add: vi.fn(),
    remove: vi.fn(),
    single: vi.fn(),
    list: vi.fn(),
  }
  state.uploadSingle = vi.fn((field) => {
    state.uploadField = field
    return state.uploadHandler
  })
  return state
})

vi.mock('../../../src/middlewares/index.js', () => ({
  authAdmin: mocks.authAdmin,
  upload: { single: mocks.uploadSingle },
}))

vi.mock('../../../src/controllers/index.js', () => ({
  productController: {
    addProduct: mocks.add,
    removeProduct: mocks.remove,
    singleProduct: mocks.single,
    listProduct: mocks.list,
  },
}))

import router from '../../../src/routes/product.js'

describe('productRouter', () => {
  it('protege modificaciones, aplica carga de imagen y deja consultas públicas', () => {
    expect(
      router.stack.map(({ route }) => ({
        path: route.path,
        method: Object.keys(route.methods)[0],
        handlers: route.stack.map(({ handle }) => handle),
      }))
    ).toEqual([
      {
        path: '/add',
        method: 'post',
        handlers: [mocks.authAdmin, mocks.uploadHandler, mocks.add],
      },
      {
        path: '/remove',
        method: 'post',
        handlers: [mocks.authAdmin, mocks.remove],
      },
      { path: '/single', method: 'post', handlers: [mocks.single] },
      { path: '/list', method: 'get', handlers: [mocks.list] },
    ])
    expect(mocks.uploadField).toBe('image')
  })
})
