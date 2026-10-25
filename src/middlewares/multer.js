import multer from 'multer'

/**
 * Configuración de almacenamiento en disco para los archivos subidos.
 * Conserva el nombre original de cada archivo.
 */
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, file.originalname)
  },
})

/**
 * Middleware de Multer configurado para guardar archivos usando `storage`.
 */
const upload = multer({ storage })

export default upload
