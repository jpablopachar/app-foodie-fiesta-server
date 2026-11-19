import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  connect: vi.fn(),
}))

vi.mock('mongoose', () => ({
  connect: mocks.connect,
}))

vi.mock('../../../src/configs/env.js', () => ({
  env: { mongoUri: 'mongodb://localhost/test' },
}))

import connectDB from '../../../src/configs/mongodb.js'

describe('connectDB', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('conecta con la URI configurada y registra el éxito', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    await connectDB()

    expect(mocks.connect).toHaveBeenCalledWith('mongodb://localhost/test')
    expect(log).toHaveBeenCalledWith('✔ Base de datos conectada')
  })

  it('registra el error cuando la conexión falla', async () => {
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.connect.mockRejectedValueOnce(new Error('connection failed'))

    await connectDB()

    expect(errorLog).toHaveBeenCalledWith(
      '❌ Falló la conexión a la base de datos: ',
      'connection failed'
    )
  })
})
