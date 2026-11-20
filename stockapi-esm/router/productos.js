import express from 'express'
import Controlador from '../controlador/productos.js'

class Router {
    #controlador = null

    constructor(persistencia) {
        this.#controlador = new Controlador(persistencia)
    }

    config() {
        const router = express.Router()

        router.get('/', this.#controlador.obtenerProductos)
        router.get('/:id', this.#controlador.obtenerProducto)
        router.post('/', this.#controlador.guardarProducto)
        router.put('/:id', this.#controlador.actualizarProducto)
        router.delete('/:id', this.#controlador.borrarProducto)

        return router
    }
}

export default Router
