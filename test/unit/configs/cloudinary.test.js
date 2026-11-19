import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  config: vi.fn(),
}))

vi.mock('cloudinary', () => ({
  v2: { config: mocks.config },
}))

vi.mock('../../../src/configs/env.js', () => ({
  env: {
    cloudinaryName: 'cloud-name',
    cloudinaryApiKey: 'cloud-key',
    cloudinaryApiSecret: 'cloud-secret',
  },
}))

import connectCloudinary from '../../../src/configs/cloudinary.js'

describe('connectCloudinary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('configura Cloudinary con las credenciales del entorno', async () => {
    await connectCloudinary()

    expect(mocks.config).toHaveBeenCalledWith({
      cloud_name: 'cloud-name',
      api_key: 'cloud-key',
      api_secret: 'cloud-secret',
    })
  })
})
