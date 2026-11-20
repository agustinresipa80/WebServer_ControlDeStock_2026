import mongoose from 'mongoose'
import CnxMongoDB from '../CnxMongoDB.js'
import { ProductoModel } from '../models/Producto.js'

const OPCIONES = { returnDocument: 'after' }

class ModeloMongoDB {
    #verificar = id => {
        if (!CnxMongoDB.connectionOK) throw new Error('Error de conexión a base de datos')
        return id === undefined || mongoose.isValidObjectId(id)
    }

    obtenerProductos = async ({ categoria } = {}) => {
        this.#verificar()
        const filtro = { activo: true, ...(categoria ? { categoria } : {}) }
        return await ProductoModel.find(filtro).sort({ nombre: 1 }).lean()
    }

    obtenerProducto = async id => {
        if (!this.#verificar(id)) return null
        return await ProductoModel.findOne({ _id: id, activo: true }).lean()
    }

    guardarProducto = async producto => {
        this.#verificar()
        const guardado = await new ProductoModel({ ...producto, activo: true }).save()
        return guardado.toObject()
    }

    actualizarProducto = async (id, datos) => {
        if (!this.#verificar(id)) return null
        return await ProductoModel.findOneAndUpdate({ _id: id, activo: true }, { $set: datos }, OPCIONES).lean()
    }

    borrarProducto = async id => {
        if (!this.#verificar(id)) return null
        return await ProductoModel.findOneAndUpdate({ _id: id, activo: true }, { $set: { activo: false } }, OPCIONES).lean()
    }

    // Atómico: la condición stockActual >= cantidad y el decremento ocurren en una sola operación
    descontarStock = async (id, cantidad) => {
        if (!this.#verificar(id)) return null
        return await ProductoModel.findOneAndUpdate(
            { _id: id, activo: true, stockActual: { $gte: cantidad } },
            { $inc: { stockActual: -cantidad } },
            OPCIONES
        ).lean()
    }

    reponerStock = async (id, cantidad) => {
        if (!this.#verificar(id)) return null
        return await ProductoModel.findOneAndUpdate({ _id: id }, { $inc: { stockActual: cantidad } }, OPCIONES).lean()
    }
}

export default ModeloMongoDB
