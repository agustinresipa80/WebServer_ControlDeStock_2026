import express from 'express'
import Controlador from '../controlador/reportes.js'

class Router {
    #controlador = null

    constructor(persistencia) {
        this.#controlador = new Controlador(persistencia)
    }

    config() {
        const router = express.Router()

        router.get('/rentabilidad', this.#controlador.obtenerRentabilidad)
        router.get('/reposicion', this.#controlador.obtenerReposicion)

        return router
    }
}

export default Router
