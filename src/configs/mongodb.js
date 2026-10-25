import { connect } from "mongoose"
import { env } from './env.js'

/**
 * Conecta la aplicación con MongoDB mediante la URI almacenada en `MONGO_URI`.
 * Informa en la consola si la conexión se establece o falla.
 *
 * @returns Promesa que se resuelve tras completar el intento de conexión.
 */
const connectDB = async ()=>{
    try {
        await connect(env.mongoUri)

        console.log("✔ Base de datos conectada")
    } catch (error) {
        console.error("❌ Falló la conexión a la base de datos: ", error.message)
    }
}

export default connectDB