import ModeloMEM from './productosMEM.js'
import ModeloMongoDB from './productosMongoDB.js'

class ModeloFactory {
    static #mem = null

    static get(tipo) {
        switch (tipo) {
            case 'MONGO':
                return new ModeloMongoDB()

            default:
                // Un único almacén en memoria compartido entre servicios
                if (!ModeloFactory.#mem) ModeloFactory.#mem = new ModeloMEM()
                return ModeloFactory.#mem
        }
    }

    static reset() {
        ModeloFactory.#mem = null
    }
}

export default ModeloFactory
