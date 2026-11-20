import request from 'supertest'
import { expect } from 'chai'
import Server from '../server.js'
import ProductosFactory from '../modelo/DAOs/productos/productosFactory.js'
import VentasFactory from '../modelo/DAOs/ventas/ventasFactory.js'

const DIA = 24 * 60 * 60 * 1000
const yerba = { nombre: 'Yerba 1kg', categoria: 'Almacén', precioCosto: 1000, precioVenta: 1500, stockActual: 10, stockMinimo: 5 }
const aceite = { nombre: 'Aceite 900ml', categoria: 'Almacén', precioCosto: 1200, precioVenta: 1800, stockActual: 40, stockMinimo: 10 }

let server, api

beforeEach(async () => {
    ProductosFactory.reset()
    VentasFactory.reset()
    server = new Server(0, 'MEM')
    api = request(await server.start())
})
afterEach(async () => { await server.stop() })

const crearProducto = async datos => (await api.post('/productos').send(datos)).body
const vender = items => api.post('/ventas').send({ items })
const stockDe = async id => (await api.get(`/productos/${id}`)).body.stockActual

// Inserta una venta histórica directamente en el DAO (para controlar la fecha)
const ventaHistorica = async (producto, cantidad, diasAtras, anulada = false) => {
    await VentasFactory.get('MEM').guardarVenta({
        fecha: new Date(Date.now() - diasAtras * DIA),
        items: [{ producto: String(producto._id), nombre: producto.nombre, categoria: producto.categoria, cantidad, precioUnitario: producto.precioVenta, costoUnitario: producto.precioCosto }],
        total: cantidad * producto.precioVenta,
        anulada
    })
}

describe('ABM de productos', () => {
    it('feliz: crea y lista un producto', async () => {
        const res = await api.post('/productos').send(yerba)
        expect(res.status).to.equal(201)
        const lista = await api.get('/productos')
        expect(lista.body).to.have.length(1)
        expect(lista.body[0].nombre).to.equal('Yerba 1kg')
    })

    it('feliz: modifica el precio de venta', async () => {
        const p = await crearProducto(yerba)
        const res = await api.put(`/productos/${p._id}`).send({ precioVenta: 1800 })
        expect(res.status).to.equal(200)
        expect(res.body.precioVenta).to.equal(1800)
    })

    it('feliz: la baja es lógica y el producto deja de listarse', async () => {
        const p = await crearProducto(yerba)
        expect((await api.delete(`/productos/${p._id}`)).status).to.equal(200)
        expect((await api.get('/productos')).body).to.have.length(0)
        expect((await api.get(`/productos/${p._id}`)).status).to.equal(404)
    })

    it('no feliz: rechaza un precio negativo', async () => {
        const res = await api.post('/productos').send({ ...yerba, precioVenta: -5 })
        expect(res.status).to.equal(400)
    })

    it('no feliz: rechaza campos desconocidos y cuerpo vacío al modificar', async () => {
        const p = await crearProducto(yerba)
        expect((await api.put(`/productos/${p._id}`).send({ activo: false })).status).to.equal(400)
        expect((await api.put(`/productos/${p._id}`).send({})).status).to.equal(400)
    })

    it('no feliz: modificar un id inexistente devuelve 404', async () => {
        const res = await api.put('/productos/no-existe').send({ precioVenta: 10 })
        expect(res.status).to.equal(404)
    })
})

describe('ABM de ventas', () => {
    it('feliz: registra una venta con varios ítems, descuenta stock y calcula el total', async () => {
        const a = await crearProducto(yerba)
        const b = await crearProducto(aceite)
        const res = await vender([{ producto: a._id, cantidad: 3 }, { producto: b._id, cantidad: 2 }])
        expect(res.status).to.equal(201)
        expect(res.body.total).to.equal(3 * 1500 + 2 * 1800)
        expect(await stockDe(a._id)).to.equal(7)
        expect(await stockDe(b._id)).to.equal(38)
    })

    it('feliz: la venta conserva el precio del momento aunque el producto cambie', async () => {
        const a = await crearProducto(yerba)
        const venta = (await vender([{ producto: a._id, cantidad: 1 }])).body
        await api.put(`/productos/${a._id}`).send({ precioVenta: 9999 })
        const guardada = (await api.get(`/ventas/${venta._id}`)).body
        expect(guardada.items[0].precioUnitario).to.equal(1500)
    })

    it('feliz: anular una venta restituye el stock', async () => {
        const a = await crearProducto(yerba)
        const venta = (await vender([{ producto: a._id, cantidad: 4 }])).body
        expect(await stockDe(a._id)).to.equal(6)
        const res = await api.delete(`/ventas/${venta._id}`)
        expect(res.status).to.equal(200)
        expect(await stockDe(a._id)).to.equal(10)
    })

    it('no feliz: stock insuficiente devuelve 400 y no cambia el stock', async () => {
        const a = await crearProducto(yerba)
        const res = await vender([{ producto: a._id, cantidad: 11 }])
        expect(res.status).to.equal(400)
        expect(res.body.error).to.include('Stock insuficiente')
        expect(await stockDe(a._id)).to.equal(10)
        expect((await api.get('/ventas')).body).to.have.length(0)
    })

    it('no feliz: si falla un ítem se devuelve el stock de los anteriores', async () => {
        const a = await crearProducto(yerba)
        const b = await crearProducto({ ...aceite, stockActual: 1 })
        const res = await vender([{ producto: a._id, cantidad: 3 }, { producto: b._id, cantidad: 5 }])
        expect(res.status).to.equal(400)
        expect(await stockDe(a._id)).to.equal(10)
    })

    it('no feliz: producto inexistente, dado de baja o cantidad inválida', async () => {
        const a = await crearProducto(yerba)
        expect((await vender([{ producto: 'xx', cantidad: 1 }])).status).to.equal(404)
        expect((await vender([{ producto: a._id, cantidad: 0 }])).status).to.equal(400)
        expect((await vender([])).status).to.equal(400)
        await api.delete(`/productos/${a._id}`)
        expect((await vender([{ producto: a._id, cantidad: 1 }])).status).to.equal(404)
    })

    it('no feliz: anular dos veces la misma venta devuelve 400', async () => {
        const a = await crearProducto(yerba)
        const venta = (await vender([{ producto: a._id, cantidad: 1 }])).body
        await api.delete(`/ventas/${venta._id}`)
        expect((await api.delete(`/ventas/${venta._id}`)).status).to.equal(400)
        expect(await stockDe(a._id)).to.equal(10)
    })
})

describe('Reporte de rentabilidad', () => {
    it('feliz: calcula ganancia y margen por producto, ordenado por ganancia', async () => {
        const a = await crearProducto(yerba)
        const b = await crearProducto(aceite)
        await ventaHistorica(a, 10, 3)
        await ventaHistorica(b, 4, 3)
        const res = await api.get('/reportes/rentabilidad')
        expect(res.status).to.equal(200)
        expect(res.body[0]).to.deep.equal({ grupo: 'Yerba 1kg', unidades: 10, ingresos: 15000, costoTotal: 10000, ganancia: 5000, margenPorcentaje: 33.33 })
        expect(res.body[1].grupo).to.equal('Aceite 900ml')
        expect(res.body[1].ganancia).to.equal(2400)
    })

    it('feliz: agrupa por categoría y excluye ventas anuladas', async () => {
        const a = await crearProducto(yerba)
        const b = await crearProducto(aceite)
        await ventaHistorica(a, 10, 3)
        await ventaHistorica(b, 4, 3)
        await ventaHistorica(b, 100, 3, true)
        const res = await api.get('/reportes/rentabilidad?agrupar=categoria')
        expect(res.body).to.have.length(1)
        expect(res.body[0].grupo).to.equal('Almacén')
        expect(res.body[0].unidades).to.equal(14)
        expect(res.body[0].ganancia).to.equal(7400)
    })

    it('no feliz: un rango sin ventas devuelve lista vacía', async () => {
        const a = await crearProducto(yerba)
        await ventaHistorica(a, 10, 3)
        const res = await api.get('/reportes/rentabilidad?desde=2000-01-01&hasta=2000-12-31')
        expect(res.status).to.equal(200)
        expect(res.body).to.deep.equal([])
    })

    it('no feliz: fechas o agrupación inválidas devuelven 400', async () => {
        expect((await api.get('/reportes/rentabilidad?desde=hola')).status).to.equal(400)
        expect((await api.get('/reportes/rentabilidad?desde=2026-02-01&hasta=2026-01-01')).status).to.equal(400)
        expect((await api.get('/reportes/rentabilidad?agrupar=color')).status).to.equal(400)
    })
})

describe('Reporte de reposición', () => {
    it('feliz: calcula rotación, días restantes y cantidad sugerida', async () => {
        const a = await crearProducto({ ...yerba, stockActual: 10 })
        await ventaHistorica(a, 30, 5)
        const res = await api.get('/reportes/reposicion?dias=30&objetivo=15')
        expect(res.status).to.equal(200)
        expect(res.body).to.have.length(1)
        expect(res.body[0].rotacionDiaria).to.equal(1)
        expect(res.body[0].diasRestantes).to.equal(10)
        expect(res.body[0].cantidadSugerida).to.equal(5)
    })

    it('feliz: un producto sin ventas por debajo del mínimo se sugiere sin dividir por cero', async () => {
        await crearProducto({ ...yerba, stockActual: 2, stockMinimo: 8 })
        const res = await api.get('/reportes/reposicion')
        expect(res.body[0].diasRestantes).to.equal(null)
        expect(res.body[0].cantidadSugerida).to.equal(6)
    })

    it('feliz: un producto con stock de sobra no aparece', async () => {
        const a = await crearProducto({ ...yerba, stockActual: 100 })
        await ventaHistorica(a, 3, 2)
        expect((await api.get('/reportes/reposicion')).body).to.have.length(0)
    })

    it('no feliz: parámetros inválidos devuelven 400', async () => {
        expect((await api.get('/reportes/reposicion?dias=0')).status).to.equal(400)
        expect((await api.get('/reportes/reposicion?objetivo=abc')).status).to.equal(400)
    })
})
