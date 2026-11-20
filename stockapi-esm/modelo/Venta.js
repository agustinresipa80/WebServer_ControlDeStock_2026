import joi from 'joi'
import { ErrorNegocio } from '../errores.js'

const schemaVenta = joi.object({
    items: joi.array().min(1).items(
        joi.object({
            producto: joi.string().required(),
            cantidad: joi.number().integer().min(1).required()
        })
    ).required()
})

class Venta {
    static validar(datos) {
        const { error, value } = schemaVenta.validate(datos)
        if (error) throw new ErrorNegocio(error.message, 400)

        // Si el mismo producto viene repetido se suman las cantidades
        const porProducto = new Map()
        value.items.forEach(({ producto, cantidad }) => {
            porProducto.set(producto, (porProducto.get(producto) || 0) + cantidad)
        })
        return [...porProducto].map(([producto, cantidad]) => ({ producto, cantidad }))
    }
}

export default Venta
