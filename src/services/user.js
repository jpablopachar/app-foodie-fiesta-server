import { compare, genSalt, hash } from 'bcrypt'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import { env } from '../configs/index.js'
import { userRepository } from '../repositories/index.js'

/**
 * Genera un token de autenticación para el identificador de usuario indicado.
 * @param id Identificador del usuario.
 * @returns Token firmado con el secreto de la aplicación.
 */
const createToken = (id) => jwt.sign({ id }, env.jwtSecret)

/**
 * Operaciones de negocio para registrar y autenticar usuarios y administradores.
 */
export const userService = {
  /**
   * Valida los datos, registra un usuario y genera su token de autenticación.
   * @param data Datos del usuario.
   * @param data.name Nombre del usuario.
   * @param data.email Correo electrónico del usuario.
   * @param data.password Contraseña sin cifrar.
   * @returns Token del usuario o mensaje de validación/error.
   */
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

  /**
   * Comprueba las credenciales de un usuario y genera su token de autenticación.
   * @param credentials Credenciales de acceso.
   * @param credentials.email Correo electrónico del usuario.
   * @param credentials.password Contraseña sin cifrar.
   * @returns Token del usuario o mensaje de error.
   */
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

  /**
   * Comprueba las credenciales administrativas configuradas y genera un token.
   * @param credentials Credenciales administrativas.
   * @param credentials.email Correo electrónico del administrador.
   * @param credentials.password Contraseña del administrador.
   * @returns Token administrativo o mensaje de error.
   */
  adminLogin({ email, password }) {
    if (email !== env.adminEmail || password !== env.adminPass) {
      return { message: 'Credenciales inválidas' }
    }

    return { token: jwt.sign(email + password, env.jwtSecret) }
  },
}
