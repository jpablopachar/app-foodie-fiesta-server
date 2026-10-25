import { compare, genSalt, hash } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { isEmail } from 'validator'
import userModel from '../models/user.js'

/**
 * Crea un token JWT para identificar a un usuario.
 * @param id Identificador del usuario.
 * @returns Token JWT firmado.
 */
const createToken = (id) => {
  return sign({ id }, process.env.JWT_SECRET)
}

/**
 * Registra un usuario nuevo después de validar sus datos y guardar su contraseña cifrada.
 * @param req Solicitud con nombre, correo y contraseña.
 * @param res Respuesta HTTP.
 * @returns Envía el resultado del registro y, si tiene éxito, un token.
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const exists = await userModel.findOne({ email })

    if (exists) {
      return res.json({ success: false, message: 'El usuario ya existe' })
    }

    if (!isEmail(email)) {
      return res.json({
        success: false,
        message: 'Por favor ingrese un correo electrónico válido',
      })
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: 'Por favor ingrese una contraseña segura',
      })
    }

    const salt = await genSalt(10)
    const hashedPassword = await hash(password, salt)

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    })

    const user = await newUser.save()
    const token = createToken(user._id)

    res.json({ success: true, token })
  } catch (error) {
    console.log(error)

    res.json({ success: false, message: error.message })
  }
}

/**
 * Autentica a un usuario mediante su correo y contraseña.
 * @param req Solicitud con correo y contraseña.
 * @param res Respuesta HTTP.
 * @returns Envía el resultado de la autenticación y, si tiene éxito, un token.
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: 'El usuario no existe' })
    }

    const isMatch = await compare(password, user.password)

    if (isMatch) {
      const token = createToken(user._id)

      res.json({ success: true, token })
    } else {
      res.json({ success: false, message: 'Credenciales inválidas' })
    }
  } catch (error) {
    console.log(error)

    res.json({ success: false, message: error.message })
  }
}

/**
 * Autentica al administrador con las credenciales configuradas en el entorno.
 * @param req Solicitud con correo y contraseña.
 * @param res Respuesta HTTP.
 * @returns Envía el resultado de la autenticación y, si tiene éxito, un token.
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASS
    ) {
      const token = sign(email + password, process.env.JWT_SECRET)

      res.json({ success: true, token })
    } else {
      res.json({ success: false, message: 'Credenciales inválidas' })
    }
  } catch (error) {
    console.log(error)

    res.json({ success: false, message: error.message })
  }
}

export { adminLogin, loginUser, registerUser }

