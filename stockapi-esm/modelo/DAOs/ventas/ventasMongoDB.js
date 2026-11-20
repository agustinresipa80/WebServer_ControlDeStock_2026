import mongoose from 'mongoose'
import CnxMongoDB from '../CnxMongoDB.js'
import { VentaModel } from '../models/Venta.js'

class ModeloMongoDB {
    #verificar = id => {
        if (!CnxMongoDB.connectionOK) throw new Error('Error de conexión a base de datos')
        return id === undefined || mongoose.isValidObjectId(id)
    }

    guardarVenta = async venta => {
        this.#verificar()
        const guardada = await new VentaModel(venta).save()
        return guardada.toObject()
    }

    obtenerVenta = async id => {
        if (!this.#verificar(id)) return null
        return await VentaModel.findById(id).lean()
    }

    obtenerVentas = async ({ desde, hasta } = {}) => {
        this.#verificar()
        const filtro = { anulada: false }
        if (desde || hasta) {
            filtro.fecha = {}
            if (desde) filtro.fecha.$gte = desde
            if (hasta) filtro.fecha.$lte = hasta
        }
        return await VentaModel.find(filtro).sort({ fecha: -1 }).lean()
    }

    anularVenta = async id => {
        if (!this.#verificar(id)) return null
        return await VentaModel.findOneAndUpdate({ _id: id, anulada: false }, { $set: { anulada: true } }, { returnDocument: 'after' }).lean()
    }
}

export default ModeloMongoDB
