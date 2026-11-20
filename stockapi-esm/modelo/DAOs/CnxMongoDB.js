import mongoose from 'mongoose'
import config from '../../config.js'

class CnxMongoDB {
    static connectionOK = false

    static conectar = async () => {
        console.log('Conectando a la base de datos (mongoose)...')
        await mongoose.connect(config.STRCNX + config.BASE)
        console.log('Base de datos conectada!')
        CnxMongoDB.connectionOK = true
    }

    static desconectar = async () => {
        if (CnxMongoDB.connectionOK) {
            await mongoose.disconnect()
            CnxMongoDB.connectionOK = false
        }
    }
}

export default CnxMongoDB
