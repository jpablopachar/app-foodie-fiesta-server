import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const state = {
    findOne: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    save: vi.fn(),
  }
  state.userModel = vi.fn(function (data) {
    this.data = data
    this.save = state.save
  })
  Object.assign(state.userModel, {
    findOne: state.findOne,
    findById: state.findById,
    findByIdAndUpdate: state.findByIdAndUpdate,
  })
  return state
})

vi.mock('../../../src/models/index.js', () => ({
  userModel: mocks.userModel,
}))

import { userRepository } from '../../../src/repositories/user.js'

describe('userRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('busca por correo y crea un usuario', async () => {
    const user = { _id: 'user-1' }
    mocks.findOne.mockResolvedValue(user)
    mocks.save.mockResolvedValue(user)

    await expect(userRepository.findByEmail('a@example.com')).resolves.toBe(
      user
    )
    await expect(
      userRepository.create({ email: 'a@example.com' })
    ).resolves.toBe(user)

    expect(mocks.findOne).toHaveBeenCalledWith({ email: 'a@example.com' })
    expect(mocks.userModel).toHaveBeenCalledWith({ email: 'a@example.com' })
  })

  it('obtiene y actualiza los datos del carrito', async () => {
    const cartData = { item: { M: 2 } }
    mocks.findById.mockResolvedValue({ cartData })
    mocks.findByIdAndUpdate.mockResolvedValue({ cartData })

    await expect(userRepository.getCart('user-1')).resolves.toEqual(cartData)
    await userRepository.saveCart('user-1', cartData)

    expect(mocks.findById).toHaveBeenCalledWith('user-1')
    expect(mocks.findByIdAndUpdate).toHaveBeenCalledWith('user-1', { cartData })
  })
})
