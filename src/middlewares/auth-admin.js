import { verify } from 'jsonwebtoken'

/**
 * Verifica que la solicitud incluya un token válido para el administrador.
 *
 * @param req Solicitud HTTP.
 * @param res Respuesta HTTP.
 * @param next Función para continuar al siguiente middleware.
 * @returns {Promise<void>} Continúa la cadena si el token es válido o envía una respuesta de error.
 */
const authAdmin = async (req, res, next) => {
  try {
    const { token } = req.headers

    if (!token) {
      return res.json({
        success: false,
        message: 'Not Authorized please login',
      })
    }

    const tokenDecode = verify(token, process.env.JWT_SECRET)

    if (tokenDecode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASS) {
      return res.json({
        success: false,
        message: 'Not Authorized please login',
      })
    }

    next()
  } catch (error) {
    console.log(error)

    res.json({ success: false, message: error.message })
  }
}

export default authAdmin
