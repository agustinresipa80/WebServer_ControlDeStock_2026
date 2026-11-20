import dotenv from 'dotenv'
dotenv.config({ quiet: true })

const PORT = process.env.PORT || 8080
const MODO_PERSISTENCIA = process.env.MODO_PERSISTENCIA || 'MEM'
const STRCNX = process.env.STRCNX || 'mongodb://localhost:27017/'
const BASE = process.env.BASE || 'stock-comercio'
const DIAS_ANALISIS = Number(process.env.DIAS_ANALISIS) || 30
const DIAS_OBJETIVO = Number(process.env.DIAS_OBJETIVO) || 15

export default { PORT, MODO_PERSISTENCIA, STRCNX, BASE, DIAS_ANALISIS, DIAS_OBJETIVO }
