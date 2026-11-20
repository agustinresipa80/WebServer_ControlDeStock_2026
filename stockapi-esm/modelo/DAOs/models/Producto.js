import mongoose from 'mongoose'

const productoSchema = new mongoose.Schema({
    nombre: String,
    categoria: String,
    precioCosto: Number,
    precioVenta: Number,
    stockActual: Number,
    stockMinimo: Number,
    activo: { type: Boolean, default: true }
}, { versionKey: false })

export const ProductoModel = mongoose.model('productos', productoSchema)
