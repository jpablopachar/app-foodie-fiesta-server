import { describe, expect, it } from 'vitest'
import orderModel from '../../../src/models/order.js'

describe('orderModel', () => {
  it('declara obligatorios los datos de la orden', () => {
    for (const field of [
      'userId',
      'items',
      'amount',
      'address',
      'paymentMethod',
      'date',
    ]) {
      expect(orderModel.schema.path(field).isRequired).toBe(true)
    }
  })

  it('inicializa el estado y el indicador de pago', () => {
    const order = new orderModel({})

    expect(order.status).toBe('Order Placed')
    expect(order.payment).toBe(false)
  })
})
