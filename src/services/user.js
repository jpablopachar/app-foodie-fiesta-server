import { compare, genSalt, hash } from 'bcrypt'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import { env } from '../configs/index.js'
import { userRepository } from '../repositories/index.js'

const createToken = (id) => jwt.sign({ id }, env.jwtSecret)

export const userService = {
  async register({ name, email, password }) {
    const exists = await userRepository.findByEmail(email)

    if (exists) {
      return { message: 'El usuario ya existe' }
    }

    if (!validator.isEmail(email)) {
      return { message: 'Por favor ingrese un correo electrónico válido' }
    }

    if (password.length < 8) {
      return { message: 'Por favor ingrese una contraseña segura' }
    }

    const salt = await genSalt(10)
    const hashedPassword = await hash(password, salt)
    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
    })

    return { token: createToken(user._id) }
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email)

    if (!user) {
      return { message: 'El usuario no existe' }
    }

    if (!(await compare(password, user.password))) {
      return { message: 'Credenciales inválidas' }
    }

    return { token: createToken(user._id) }
  },

  adminLogin({ email, password }) {
    if (email !== env.adminEmail || password !== env.adminPass) {
      return { message: 'Credenciales inválidas' }
    }

    return { token: jwt.sign(email + password, env.jwtSecret) }
  },
}
