import express from 'express'
import Controlador from '../controlador/ventas.js'

class Router {
    #controlador = null

    constructor(persistencia) {
        this.#controlador = new Controlador(persistencia)
    }

    config() {
        const router = express.Router()

        router.post('/', this.#controlador.guardarVenta)
        router.get('/', this.#controlador.obtenerVentas)
        router.get('/:id', this.#controlador.obtenerVenta)
        router.delete('/:id', this.#controlador.anularVenta)

        return router
    }
}

export default Router
