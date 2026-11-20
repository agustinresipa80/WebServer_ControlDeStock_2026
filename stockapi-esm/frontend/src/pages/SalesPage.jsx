import { useEffect, useState } from 'react'
import { AlertTriangle, ChevronDown, CircleDollarSign, Plus, RefreshCw, ShoppingCart, X } from 'lucide-react'
import { EmptyState, Loading } from '../components/ui/Feedback.jsx'
import Metric from '../components/ui/Metric.jsx'
import PageHeading from '../components/ui/PageHeading.jsx'
import { api } from '../services/api.js'
import { formatDate, money } from '../services/formatters.js'

function SalesPage({ notify }) {
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [items, setItems] = useState([{ producto: '', cantidad: 1 }])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function loadSales() {
    setLoading(true)
    try {
      const [productList, salesList] = await Promise.all([api('/productos'), api('/ventas')])
      setProducts(productList)
      setSales(salesList)
    } catch (error) { notify(error.message, 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { loadSales() }, [])

  function updateItem(index, key, value) { setItems(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item)) }
  function addItem() { setItems(current => [...current, { producto: '', cantidad: 1 }]) }
  function removeItem(index) { setItems(current => current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index)) }

  const totalPreview = items.reduce((total, item) => total + (Number(products.find(product => product._id === item.producto)?.precioVenta) || 0) * (Number(item.cantidad) || 0), 0)

  async function submitSale(event) {
    event.preventDefault()
    setSaving(true)
    try {
      await api('/ventas', { method: 'POST', body: JSON.stringify({ items: items.map(item => ({ producto: item.producto, cantidad: Number(item.cantidad) })) }) })
      notify('Venta registrada y stock actualizado.')
      setItems([{ producto: '', cantidad: 1 }])
      await loadSales()
    } catch (error) { notify(error.message, 'error') }
    finally { setSaving(false) }
  }

  async function cancelSale(sale) {
    if (!window.confirm('¿Anular esta venta? Se restituirá el stock de sus productos.')) return
    try { await api(`/ventas/${sale._id}`, { method: 'DELETE' }); notify('Venta anulada y stock restituido.'); await loadSales() }
    catch (error) { notify(error.message, 'error') }
  }

  return <>
    <PageHeading eyebrow="OPERACIONES · VENTAS" title="Ventas" description="Registra ventas, consulta el historial y prueba la anulación." action={<button className="button secondary" onClick={loadSales}><RefreshCw size={16} />Actualizar</button>} />
    <div className="metric-strip sales-metrics"><Metric icon={<ShoppingCart size={18} />} label="Ventas activas" value={sales.length} detail="sin anular" /><Metric icon={<CircleDollarSign size={18} />} label="Importe registrado" value={money(sales.reduce((sum, sale) => sum + Number(sale.total), 0))} detail="ventas activas" /></div>
    <div className="workspace-grid sales-grid">
      <section className="panel table-panel">
        <div className="panel-heading"><div><h2>Historial de ventas</h2><span>{sales.length} registros activos</span></div></div>
        {loading ? <Loading /> : sales.length ? <div className="table-scroll"><table><thead><tr><th>FECHA</th><th>PRODUCTOS</th><th>UNIDADES</th><th>TOTAL</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>
          {sales.map(sale => <tr key={sale._id}><td className="date-cell">{formatDate(sale.fecha)}</td><td><div className="product-name">{sale.items?.map(item => item.nombre).join(', ') || '—'}</div><div className="sub-cell">{String(sale._id).slice(-8)}</div></td><td>{sale.items?.reduce((sum, item) => sum + Number(item.cantidad), 0) || 0}</td><td className="price-cell">{money(sale.total)}</td><td><button className="icon-button danger-hover" onClick={() => cancelSale(sale)} title="Anular venta" aria-label="Anular venta"><X size={16} /></button></td></tr>)}
        </tbody></table></div> : <EmptyState title="Todavía no hay ventas" body="Las ventas registradas aparecerán en este listado." />}
      </section>
      <section className="panel form-panel sale-form-panel">
        <div className="panel-heading"><div><span className="form-kicker">NUEVA OPERACIÓN</span><h2>Registrar venta</h2></div></div>
        <form className="stack-form" onSubmit={submitSale}>
          <div className="sale-items-label"><span>PRODUCTOS</span><button type="button" className="small-action" onClick={addItem}><Plus size={14} />Agregar ítem</button></div>
          {items.map((item, index) => <div className="sale-line" key={index}>
            <label className="field"><span>Producto</span><span className="select-wrap"><select required value={item.producto} onChange={event => updateItem(index, 'producto', event.target.value)}><option value="">Seleccionar producto</option>{products.map(product => <option key={product._id} value={product._id} disabled={Number(product.stockActual) < 1}>{product.nombre} · {money(product.precioVenta)} · stock {product.stockActual}</option>)}</select><ChevronDown size={15} /></span></label>
            <label className="field quantity-field"><span>Cantidad</span><input type="number" min="1" step="1" required value={item.cantidad} onChange={event => updateItem(index, 'cantidad', event.target.value)} /></label>
            <button type="button" className="icon-button remove-line" onClick={() => removeItem(index)} disabled={items.length === 1} title="Quitar ítem" aria-label="Quitar ítem"><X size={16} /></button>
          </div>)}
          {products.length === 0 && !loading && <p className="inline-warning"><AlertTriangle size={15} /> Primero crea un producto con stock disponible.</p>}
          <div className="sale-total"><span>Total estimado</span><strong>{money(totalPreview)}</strong></div>
          <button type="submit" className="button primary full-button" disabled={saving || products.length === 0}>{saving ? 'Procesando...' : <><ShoppingCart size={16} />Confirmar venta</>}</button>
        </form>
      </section>
    </div>
  </>
}

export default SalesPage