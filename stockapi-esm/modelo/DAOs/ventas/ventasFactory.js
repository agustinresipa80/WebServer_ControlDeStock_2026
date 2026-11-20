import ModeloMEM from './ventasMEM.js'
import ModeloMongoDB from './ventasMongoDB.js'

class ModeloFactory {
    static #mem = null

    static get(tipo) {
        switch (tipo) {
            case 'MONGO':
                return new ModeloMongoDB()

            default:
                if (!ModeloFactory.#mem) ModeloFactory.#mem = new ModeloMEM()
                return ModeloFactory.#mem
        }
    }

    static reset() {
        ModeloFactory.#mem = null
    }
}

export default ModeloFactory
