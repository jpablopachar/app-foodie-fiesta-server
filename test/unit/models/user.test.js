import { describe, expect, it } from 'vitest'
import userModel from '../../../src/models/user.js'

describe('userModel', () => {
  it('declara obligatorios nombre, correo y contraseña', () => {
    for (const field of ['name', 'email', 'password']) {
      expect(userModel.schema.path(field).isRequired).toBe(true)
    }
  })

  it('inicializa el carrito vacío y conserva objetos vacíos', () => {
    const user = new userModel({})

    expect(user.cartData).toEqual({})
    expect(userModel.schema.options.minimize).toBe(false)
  })
})
