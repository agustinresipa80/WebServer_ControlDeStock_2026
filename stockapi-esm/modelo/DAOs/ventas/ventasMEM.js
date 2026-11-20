import { randomUUID } from 'crypto'

class ModeloMEM {
    #ventas = new Map()

    #copia = v => (v ? { ...v, items: v.items.map(i => ({ ...i })) } : null)

    guardarVenta = async venta => {
        const nueva = { _id: randomUUID(), ...venta }
        this.#ventas.set(nueva._id, nueva)
        return this.#copia(nueva)
    }

    obtenerVenta = async id => this.#copia(this.#ventas.get(String(id)))

    // Devuelve solo ventas no anuladas, opcionalmente dentro de un rango de fechas
    obtenerVentas = async ({ desde, hasta } = {}) => {
        return [...this.#ventas.values()]
            .filter(v => !v.anulada && (!desde || v.fecha >= desde) && (!hasta || v.fecha <= hasta))
            .sort((a, b) => b.fecha - a.fecha)
            .map(this.#copia)
    }

    // Devuelve null si no existe o ya estaba anulada
    anularVenta = async id => {
        const v = this.#ventas.get(String(id))
        if (!v || v.anulada) return null
        v.anulada = true
        return this.#copia(v)
    }
}

export default ModeloMEM
