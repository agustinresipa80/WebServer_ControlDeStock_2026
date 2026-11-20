import Servicio from '../servicio/productos.js'
import { responderError } from '../errores.js'

class Controlador {
    #servicio = null

    constructor(persistencia) {
        this.#servicio = new Servicio(persistencia)
    }

    obtenerProductos = async (req, res) => {
        try { res.json(await this.#servicio.obtenerProductos(req.query.categoria)) }
        catch (error) { responderError(req, res, error) }
    }

    obtenerProducto = async (req, res) => {
        try { res.json(await this.#servicio.obtenerProducto(req.params.id)) }
        catch (error) { responderError(req, res, error) }
    }

    guardarProducto = async (req, res) => {
        try { res.status(201).json(await this.#servicio.guardarProducto(req.body)) }
        catch (error) { responderError(req, res, error) }
    }

    actualizarProducto = async (req, res) => {
        try { res.json(await this.#servicio.actualizarProducto(req.params.id, req.body)) }
        catch (error) { responderError(req, res, error) }
    }

    borrarProducto = async (req, res) => {
        try { res.json(await this.#servicio.borrarProducto(req.params.id)) }
        catch (error) { responderError(req, res, error) }
    }
}

export default Controlador
