import { verify } from 'jsonwebtoken'

/**
 * Comprueba la autenticación del usuario mediante el token recibido.
 * Si el token es válido, agrega su identificador al cuerpo de la solicitud
 * y continúa con el siguiente middleware; de lo contrario, responde con un error.
 *
 * @param req Solicitud HTTP con el token en los encabezados.
 * @param res Respuesta HTTP para informar errores de autenticación.
 * @param next Función para continuar la cadena de middleware.
 * @returns Promesa que se resuelve tras continuar o responder a la solicitud.
 */
const authUser = async (req, res, next) => {
  const { token } = req.headers

  if (!token) {
    return res.json({
      success: false,
      message: 'No autorizado, por favor inicie sesión',
    })
  }

  try {
    const tokenDecode = verify(token, process.env.JWT_SECRET)

    req.body.userId = tokenDecode.id

    next()
  } catch (error) {
    console.log(error)

    res.json({ success: false, message: 'Token inválido o expirado' })
  }
}

export default authUser
