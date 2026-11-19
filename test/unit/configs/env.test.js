import { afterEach, describe, expect, it, vi } from 'vitest'

describe('env', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('lee las variables de entorno y expone una configuración inmutable', async () => {
    vi.stubEnv('PORT', '5050')
    vi.stubEnv('MONGO_URI', 'mongodb://localhost/test')
    vi.stubEnv('JWT_SECRET', 'test-secret')
    vi.stubEnv('ADMIN_EMAIL', 'admin@example.com')
    vi.stubEnv('ADMIN_PASS', 'admin-password')
    vi.stubEnv('CLOUDINARY_NAME', 'cloud')
    vi.stubEnv('CLOUDINARY_API_KEY', 'api-key')
    vi.stubEnv('CLOUDINARY_API_SECRET', 'api-secret')
    vi.stubEnv('STRIPE_SECRET_KEY', 'stripe-secret')

    const { env } = await import('../../../src/configs/env.js')

    expect(env).toEqual({
      port: '5050',
      mongoUri: 'mongodb://localhost/test',
      jwtSecret: 'test-secret',
      adminEmail: 'admin@example.com',
      adminPass: 'admin-password',
      cloudinaryName: 'cloud',
      cloudinaryApiKey: 'api-key',
      cloudinaryApiSecret: 'api-secret',
      stripeSecretKey: 'stripe-secret',
    })
    expect(Object.isFrozen(env)).toBe(true)
  })

  it('usa el puerto predeterminado cuando PORT no está definido', async () => {
    vi.stubEnv('PORT', '')
    vi.resetModules()

    const { env } = await import('../../../src/configs/env.js')

    expect(env.port).toBe(4000)
  })
})
