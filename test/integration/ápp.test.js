import { describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'

vi.mock('../../src/routes/index.js', async () => {
  const { default: express } = await import('express')

  return {
    cartRouter: express.Router(),
    orderRouter: express.Router(),
    productRouter: express.Router(),
    userRouter: express.Router(),
  }
})

describe('GET /', () => {
  it('responde que la API está funcionando', async () => {
    // Arrange
    const endpoint = '/'

    // Act
    const response = await request(app).get(endpoint)

    // Assert
    expect(response.status).toBe(200)
    expect(response.text).toBe('API funcionando')
  })
})