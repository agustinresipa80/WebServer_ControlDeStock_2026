import Servicio from '../servicio/ventas.js'
import { responderError } from '../errores.js'

class Controlador {
    #servicio = null

    constructor(persistencia) {
        this.#servicio = new Servicio(persistencia)
    }

    guardarVenta = async (req, res) => {
        try { res.status(201).json(await this.#servicio.guardarVenta(req.body)) }
        catch (error) { responderError(req, res, error) }
    }

    obtenerVentas = async (req, res) => {
        try { res.json(await this.#servicio.obtenerVentas()) }
        catch (error) { responderError(req, res, error) }
    }

    obtenerVenta = async (req, res) => {
        try { res.json(await this.#servicio.obtenerVenta(req.params.id)) }
        catch (error) { responderError(req, res, error) }
    }

    anularVenta = async (req, res) => {
        try { res.json(await this.#servicio.anularVenta(req.params.id)) }
        catch (error) { responderError(req, res, error) }
    }
}

export default Controlador
