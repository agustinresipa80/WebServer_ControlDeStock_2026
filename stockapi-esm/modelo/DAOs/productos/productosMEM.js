import { randomUUID } from 'crypto'

class ModeloMEM {
    #productos = new Map()

    #copia = p => (p ? { ...p } : null)

    obtenerProductos = async ({ categoria } = {}) => {
        return [...this.#productos.values()]
            .filter(p => p.activo && (!categoria || p.categoria === categoria))
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
            .map(this.#copia)
    }

    obtenerProducto = async id => {
        const p = this.#productos.get(String(id))
        return p && p.activo ? this.#copia(p) : null
    }

    guardarProducto = async producto => {
        const nuevo = { _id: randomUUID(), ...producto, activo: true }
        this.#productos.set(nuevo._id, nuevo)
        return this.#copia(nuevo)
    }

    actualizarProducto = async (id, datos) => {
        const p = this.#productos.get(String(id))
        if (!p || !p.activo) return null
        Object.assign(p, datos)
        return this.#copia(p)
    }

    borrarProducto = async id => {
        const p = this.#productos.get(String(id))
        if (!p || !p.activo) return null
        p.activo = false
        return this.#copia(p)
    }

    // Descuento condicional: solo si alcanza el stock (equivale al $inc con $gte de Mongo)
    descontarStock = async (id, cantidad) => {
        const p = this.#productos.get(String(id))
        if (!p || !p.activo || p.stockActual < cantidad) return null
        p.stockActual -= cantidad
        return this.#copia(p)
    }

    reponerStock = async (id, cantidad) => {
        const p = this.#productos.get(String(id))
        if (!p) return null
        p.stockActual += cantidad
        return this.#copia(p)
    }
}

export default ModeloMEM
