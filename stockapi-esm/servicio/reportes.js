import ProductosFactory from '../modelo/DAOs/productos/productosFactory.js'
import VentasFactory from '../modelo/DAOs/ventas/ventasFactory.js'
import config from '../config.js'
import { ErrorNegocio } from '../errores.js'

const DIA_MS = 24 * 60 * 60 * 1000
const redondear = n => +n.toFixed(2)

const parsearFecha = (valor, finDelDia = false) => {
    if (valor === undefined || valor === '') return undefined
    const soloFecha = /^\d{4}-\d{2}-\d{2}$/.test(valor)
    const fecha = new Date(soloFecha && finDelDia ? `${valor}T23:59:59.999Z` : valor)
    if (isNaN(fecha.getTime())) throw new ErrorNegocio(`Fecha inválida: ${valor}`, 400)
    return fecha
}

const parsearEntero = (valor, defecto, nombre) => {
    if (valor === undefined) return defecto
    const n = Number(valor)
    if (!Number.isInteger(n) || n < 1) throw new ErrorNegocio(`${nombre} debe ser un entero mayor a 0`, 400)
    return n
}

class Servicio {
    #productos = null
    #ventas = null

    constructor(persistencia) {
        this.#productos = ProductosFactory.get(persistencia)
        this.#ventas = VentasFactory.get(persistencia)
    }

    // Caso complejo 1: transforma las ventas en ganancia y margen por producto o categoría
    obtenerRentabilidad = async ({ desde, hasta, agrupar = 'producto' } = {}) => {
        if (!['producto', 'categoria'].includes(agrupar)) {
            throw new ErrorNegocio('agrupar debe ser "producto" o "categoria"', 400)
        }
        const fechaDesde = parsearFecha(desde)
        const fechaHasta = parsearFecha(hasta, true)
        if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
            throw new ErrorNegocio('"desde" no puede ser posterior a "hasta"', 400)
        }

        const ventas = await this.#ventas.obtenerVentas({ desde: fechaDesde, hasta: fechaHasta })
        const grupos = new Map()

        ventas.forEach(venta => venta.items.forEach(item => {
            const clave = agrupar === 'producto' ? item.nombre : item.categoria
            const g = grupos.get(clave) || { grupo: clave, unidades: 0, ingresos: 0, costoTotal: 0 }
            g.unidades += item.cantidad
            g.ingresos += item.cantidad * item.precioUnitario
            g.costoTotal += item.cantidad * item.costoUnitario
            grupos.set(clave, g)
        }))

        return [...grupos.values()]
            .map(g => {
                const ganancia = g.ingresos - g.costoTotal
                return {
                    grupo: g.grupo,
                    unidades: g.unidades,
                    ingresos: redondear(g.ingresos),
                    costoTotal: redondear(g.costoTotal),
                    ganancia: redondear(ganancia),
                    margenPorcentaje: g.ingresos > 0 ? redondear(ganancia / g.ingresos * 100) : 0
                }
            })
            .sort((a, b) => b.ganancia - a.ganancia)
    }

    // Caso complejo 2: estima rotación y cuánto reponer
    obtenerReposicion = async ({ dias, objetivo } = {}) => {
        const diasAnalisis = parsearEntero(dias, config.DIAS_ANALISIS, 'dias')
        const diasObjetivo = parsearEntero(objetivo, config.DIAS_OBJETIVO, 'objetivo')

        const desde = new Date(Date.now() - diasAnalisis * DIA_MS)
        const ventas = await this.#ventas.obtenerVentas({ desde })
        const vendidas = new Map()
        ventas.forEach(v => v.items.forEach(i => vendidas.set(i.producto, (vendidas.get(i.producto) || 0) + i.cantidad)))

        const productos = await this.#productos.obtenerProductos()

        return productos
            .map(p => {
                const rotacion = (vendidas.get(String(p._id)) || 0) / diasAnalisis
                const diasRestantes = rotacion > 0 ? p.stockActual / rotacion : null
                const porRotacion = Math.ceil(rotacion * diasObjetivo - p.stockActual)
                const porMinimo = p.stockMinimo - p.stockActual
                return {
                    producto: String(p._id),
                    nombre: p.nombre,
                    stockActual: p.stockActual,
                    stockMinimo: p.stockMinimo,
                    rotacionDiaria: redondear(rotacion),
                    diasRestantes: diasRestantes === null ? null : redondear(diasRestantes),
                    cantidadSugerida: Math.max(porRotacion, porMinimo, 0)
                }
            })
            .filter(r => r.cantidadSugerida > 0)
            .sort((a, b) => (a.diasRestantes ?? Infinity) - (b.diasRestantes ?? Infinity))
    }
}

export default Servicio
