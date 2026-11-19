import { userService } from '../services/index.js'

/**
 * Controladores HTTP para el registro y la autenticación de usuarios.
 */
export const userController = {
  /**
   * Registra un usuario y devuelve un token de autenticación si tiene éxito.
   * @param req Solicitud con nombre, correo y contraseña en el cuerpo.
   * @param res Respuesta HTTP.
   * @returns Envía el token o el mensaje correspondiente.
   */
  async registerUser(req, res) {
    try {
      const result = await userService.register(req.body)
      res.json({ success: 'token' in result, ...result })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },

  /**
   * Inicia sesión de usuario y devuelve un token de autenticación si tiene éxito.
   * @param req Solicitud con correo y contraseña en el cuerpo.
   * @param res Respuesta HTTP.
   * @returns Envía el token o el mensaje correspondiente.
   */
  async loginUser(req, res) {
    try {
      const result = await userService.login(req.body)
      res.json({ success: 'token' in result, ...result })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },

  /**
   * Autentica al administrador con sus credenciales configuradas.
   * @param req Solicitud con correo y contraseña en el cuerpo.
   * @param res Respuesta HTTP.
   * @returns Envía el token o el mensaje correspondiente.
   */
  async adminLogin(req, res) {
    try {
      const result = userService.adminLogin(req.body)
      res.json({ success: 'token' in result, ...result })
    } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
    }
  },
}
