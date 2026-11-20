import ProductosFactory from '../modelo/DAOs/productos/productosFactory.js'
import VentasFactory from '../modelo/DAOs/ventas/ventasFactory.js'
import Venta from '../modelo/Venta.js'
import { ErrorNegocio } from '../errores.js'

class Servicio {
    #productos = null
    #ventas = null

    constructor(persistencia) {
        this.#productos = ProductosFactory.get(persistencia)
        this.#ventas = VentasFactory.get(persistencia)
    }

    guardarVenta = async datos => {
        const pedidos = Venta.validar(datos)
        const descontados = []
        const items = []

        try {
            for (const { producto: id, cantidad } of pedidos) {
                const producto = await this.#productos.obtenerProducto(id)
                if (!producto) throw new ErrorNegocio(`Producto no encontrado: ${id}`, 404)

                // Descuento atómico: si no alcanza el stock devuelve null y no modifica nada
                const actualizado = await this.#productos.descontarStock(id, cantidad)
                if (!actualizado) {
                    throw new ErrorNegocio(`Stock insuficiente de ${producto.nombre}: quedan ${producto.stockActual}`, 400)
                }

                descontados.push({ id, cantidad })
                // Se guardan precio y costo del momento para que la rentabilidad histórica no cambie
                items.push({
                    producto: String(producto._id),
                    nombre: producto.nombre,
                    categoria: producto.categoria,
                    cantidad,
                    precioUnitario: producto.precioVenta,
                    costoUnitario: producto.precioCosto
                })
            }
        }
        catch (error) {
            // Si falló un ítem se devuelve el stock de los anteriores
            for (const { id, cantidad } of descontados) await this.#productos.reponerStock(id, cantidad)
            throw error
        }

        const total = items.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0)
        return await this.#ventas.guardarVenta({ fecha: new Date(), items, total, anulada: false })
    }

    obtenerVentas = async () => await this.#ventas.obtenerVentas()

    obtenerVenta = async id => {
        const venta = await this.#ventas.obtenerVenta(id)
        if (!venta) throw new ErrorNegocio('Venta no encontrada', 404)
        return venta
    }

    // Anular marca la venta (nunca se borra) y restituye el stock
    anularVenta = async id => {
        const existente = await this.obtenerVenta(id)
        if (existente.anulada) throw new ErrorNegocio('La venta ya está anulada', 400)

        const anulada = await this.#ventas.anularVenta(id)
        if (!anulada) throw new ErrorNegocio('La venta ya está anulada', 400)

        for (const item of anulada.items) await this.#productos.reponerStock(item.producto, item.cantidad)
        return anulada
    }
}

export default Servicio
