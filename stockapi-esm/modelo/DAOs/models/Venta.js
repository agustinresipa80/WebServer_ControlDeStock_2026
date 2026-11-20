import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema({
    producto: String,
    nombre: String,
    categoria: String,
    cantidad: Number,
    precioUnitario: Number,
    costoUnitario: Number
}, { _id: false })

const ventaSchema = new mongoose.Schema({
    fecha: { type: Date, default: Date.now },
    items: [itemSchema],
    total: Number,
    anulada: { type: Boolean, default: false }
}, { versionKey: false })

export const VentaModel = mongoose.model('ventas', ventaSchema)
