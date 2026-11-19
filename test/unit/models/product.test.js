import { describe, expect, it } from 'vitest'
import productModel from '../../../src/models/product.js'

describe('productModel', () => {
  it('declara obligatorios los datos necesarios y deja popular opcional', () => {
    for (const field of [
      'name',
      'description',
      'category',
      'image',
      'price',
      'date',
      'sizes',
    ]) {
      expect(productModel.schema.path(field).isRequired).toBe(true)
    }

    expect(productModel.schema.path('popular').isRequired).toBeFalsy()
  })
})
