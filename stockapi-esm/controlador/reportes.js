import Servicio from '../servicio/reportes.js'
import { responderError } from '../errores.js'

class Controlador {
    #servicio = null

    constructor(persistencia) {
        this.#servicio = new Servicio(persistencia)
    }

    obtenerRentabilidad = async (req, res) => {
        try { res.json(await this.#servicio.obtenerRentabilidad(req.query)) }
        catch (error) { responderError(req, res, error) }
    }

    obtenerReposicion = async (req, res) => {
        try { res.json(await this.#servicio.obtenerReposicion(req.query)) }
        catch (error) { responderError(req, res, error) }
    }
}

export default Controlador
