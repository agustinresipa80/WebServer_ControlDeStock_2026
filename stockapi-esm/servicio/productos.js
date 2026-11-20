import ModelFactory from '../modelo/DAOs/productos/productosFactory.js'
import Producto from '../modelo/Producto.js'
import { ErrorNegocio } from '../errores.js'

class Servicio {
    #modelo = null

    constructor(persistencia) {
        this.#modelo = ModelFactory.get(persistencia)
    }

    obtenerProductos = async categoria => await this.#modelo.obtenerProductos({ categoria })

    obtenerProducto = async id => {
        const producto = await this.#modelo.obtenerProducto(id)
        if (!producto) throw new ErrorNegocio('Producto no encontrado', 404)
        return producto
    }

    guardarProducto = async datos => {
        const producto = new Producto(datos)
        producto.validar()
        return await this.#modelo.guardarProducto(producto.get())
    }

    actualizarProducto = async (id, datos) => {
        const validos = Producto.validarModificacion(datos)
        const actualizado = await this.#modelo.actualizarProducto(id, validos)
        if (!actualizado) throw new ErrorNegocio('Producto no encontrado', 404)
        return actualizado
    }

    // Baja lógica: el producto deja de listarse pero las ventas históricas siguen siendo válidas
    borrarProducto = async id => {
        const eliminado = await this.#modelo.borrarProducto(id)
        if (!eliminado) throw new ErrorNegocio('Producto no encontrado', 404)
        return eliminado
    }
}

export default Servicio
