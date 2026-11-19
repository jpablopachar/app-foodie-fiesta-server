import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const state = {
    storage: { destination: 'test-storage' },
    upload: { single: vi.fn() },
  }
  state.diskStorage = vi.fn((options) => {
    state.storageOptions = options
    return state.storage
  })
  state.multer = vi.fn(() => state.upload)
  return state
})

vi.mock('multer', () => ({
  default: Object.assign(mocks.multer, { diskStorage: mocks.diskStorage }),
}))

import upload from '../../../src/middlewares/multer.js'

describe('configuración de Multer', () => {
  it('guarda el archivo con su nombre original y configura el storage', () => {
    expect(upload).toBe(mocks.upload)
    expect(mocks.storageOptions).toMatchObject({
      filename: expect.any(Function),
    })

    const callback = vi.fn()
    mocks.storageOptions.filename({}, { originalname: 'dish.png' }, callback)

    expect(callback).toHaveBeenCalledWith(null, 'dish.png')
  })
})
