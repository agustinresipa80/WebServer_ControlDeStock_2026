import express from 'express'
import cors from 'cors'
import RouterProductos from './router/productos.js'
import RouterVentas from './router/ventas.js'
import RouterReportes from './router/reportes.js'
import CnxMongoDB from './modelo/DAOs/CnxMongoDB.js'

class Server {
    #port = null
    #persistencia = null
    #routerProductos = null
    #routerVentas = null
    #routerReportes = null
    #server = null

    constructor(port, persistencia) {
        this.#port = port
        this.#persistencia = persistencia
        this.#routerProductos = new RouterProductos(persistencia)
        this.#routerVentas = new RouterVentas(persistencia)
        this.#routerReportes = new RouterReportes(persistencia)
    }

    async start() {
        const app = express()

        app.use(cors())
        app.use(express.json())

        app.use('/productos', this.#routerProductos.config())
        app.use('/ventas', this.#routerVentas.config())
        app.use('/reportes', this.#routerReportes.config())

        let persistenciaOK = true

        if (this.#persistencia == 'MONGO') {
            try {
                await CnxMongoDB.conectar()
            }
            catch (error) {
                console.log(`Error en la conexión de base de datos: ${error.message}`)
                persistenciaOK = false
            }
        }

        if (persistenciaOK) {
            this.#server = app.listen(this.#port, () => console.log(`Servidor escuchando en el puerto ${this.#port} (persistencia ${this.#persistencia})`))
            this.#server.on('error', error => console.log('Servidor en error:', error))
        }

        return app
    }

    async stop() {
        if (this.#server) {
            this.#server.close()
            await CnxMongoDB.desconectar()
            this.#server = null
        }
    }
}

export default Server
