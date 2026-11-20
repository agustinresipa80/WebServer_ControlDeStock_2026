import joi from 'joi'
import { ErrorNegocio } from '../errores.js'

const campos = {
    nombre: joi.string().trim().min(1).max(50),
    categoria: joi.string().trim().min(1).max(30),
    precioCosto: joi.number().min(0),
    precioVenta: joi.number().min(0),
    stockActual: joi.number().integer().min(0),
    stockMinimo: joi.number().integer().min(0)
}

const schemaAlta = joi.object({
    nombre: campos.nombre.required(),
    categoria: campos.categoria.required(),
    precioCosto: campos.precioCosto.required(),
    precioVenta: campos.precioVenta.required(),
    stockActual: campos.stockActual.default(0),
    stockMinimo: campos.stockMinimo.default(0)
})

const schemaModificacion = joi.object(campos).min(1)

class Producto {
    #datos = null

    constructor(datos) {
        this.#datos = datos
    }

    validar() {
        const { error, value } = schemaAlta.validate(this.#datos)
        if (error) throw new ErrorNegocio(error.message, 400)
        this.#datos = value
    }

    get() {
        return { ...this.#datos }
    }

    static validarModificacion(datos) {
        const { error, value } = schemaModificacion.validate(datos)
        if (error) throw new ErrorNegocio(error.message, 400)
        return value
    }
}

export default Producto
