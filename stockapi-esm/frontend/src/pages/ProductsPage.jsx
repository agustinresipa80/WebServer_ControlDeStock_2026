import { useEffect, useState } from 'react'
import { AlertTriangle, Boxes, Check, CircleDollarSign, ClipboardList, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react'
import Field from '../components/ui/Field.jsx'
import { EmptyState, Loading } from '../components/ui/Feedback.jsx'
import Metric from '../components/ui/Metric.jsx'
import PageHeading from '../components/ui/PageHeading.jsx'
import { api } from '../services/api.js'
import { money } from '../services/formatters.js'

function ProductsPage({ notify }) {
  const emptyProduct = { nombre: '', categoria: '', precioCosto: '', precioVenta: '', stockActual: 0, stockMinimo: 0 }
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [saving, setSaving] = useState(false)

  async function loadProducts() {
    setLoading(true)
    try { setProducts(await api('/productos')) }
    catch (error) { notify(error.message, 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { loadProducts() }, [])

  function changeField(event) {
    const { name, value } = event.target
    setForm(current => ({ ...current, [name]: value }))
  }

  function startEdit(product) {
    setEditing(product._id)
    setForm({ nombre: product.nombre, categoria: product.categoria, precioCosto: product.precioCosto, precioVenta: product.precioVenta, stockActual: product.stockActual, stockMinimo: product.stockMinimo })
    document.querySelector('#product-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function resetForm() { setEditing(null); setForm(emptyProduct) }

  async function submitProduct(event) {
    event.preventDefault()
    setSaving(true)
    const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, ['precioCosto', 'precioVenta', 'stockActual', 'stockMinimo'].includes(key) ? Number(value) : value]))
    try {
      await api(editing ? `/productos/${editing}` : '/productos', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload) })
      notify(editing ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.')
      resetForm()
      await loadProducts()
    } catch (error) { notify(error.message, 'error') }
    finally { setSaving(false) }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`¿Dar de baja a “${product.nombre}”?`)) return
    try { await api(`/productos/${product._id}`, { method: 'DELETE' }); notify('Producto dado de baja.'); await loadProducts() }
    catch (error) { notify(error.message, 'error') }
  }

  const filtered = products.filter(product => `${product.nombre} ${product.categoria}`.toLowerCase().includes(search.toLowerCase()))
  const lowStock = products.filter(product => Number(product.stockActual) <= Number(product.stockMinimo)).length

  return <>
    <PageHeading eyebrow="CATÁLOGO · ABM" title="Productos" description="Administra el catálogo y prueba las operaciones de productos." action={<button className="button secondary" onClick={loadProducts}><RefreshCw size={16} />Actualizar</button>} />
    <div className="metric-strip">
      <Metric icon={<Boxes size={18} />} label="Productos activos" value={products.length} detail="en catálogo" />
      <Metric icon={<AlertTriangle size={18} />} label="Stock bajo" value={lowStock} detail="en mínimo o por debajo" warning={lowStock > 0} />
      <Metric icon={<CircleDollarSign size={18} />} label="Valor de venta" value={money(products.reduce((sum, product) => sum + Number(product.precioVenta) * Number(product.stockActual), 0))} detail="stock actual valorizado" />
    </div>
    <div className="workspace-grid product-grid">
      <section className="panel table-panel">
        <div className="panel-heading"><div><h2>Listado de productos</h2><span>{filtered.length} registros</span></div><label className="search-box"><Search size={16} /><input placeholder="Buscar producto o categoría" value={search} onChange={event => setSearch(event.target.value)} /></label></div>
        {loading ? <Loading /> : filtered.length ? <div className="table-scroll"><table><thead><tr><th>PRODUCTO</th><th>CATEGORÍA</th><th>PRECIO VENTA</th><th>STOCK</th><th>ESTADO</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>
          {filtered.map(product => <tr key={product._id}>
            <td><div className="product-name">{product.nombre}</div><div className="sub-cell">Costo {money(product.precioCosto)}</div></td>
            <td><span className="category-label">{product.categoria}</span></td><td className="price-cell">{money(product.precioVenta)}</td>
            <td><span className="stock-number">{product.stockActual}</span><span className="stock-min"> / mín. {product.stockMinimo}</span></td>
            <td><span className={`pill ${Number(product.stockActual) <= Number(product.stockMinimo) ? 'low' : 'good'}`}>{Number(product.stockActual) <= Number(product.stockMinimo) ? 'Reponer' : 'Disponible'}</span></td>
            <td><div className="row-actions"><button className="icon-button" onClick={() => startEdit(product)} title="Editar producto" aria-label={`Editar ${product.nombre}`}><ClipboardList size={16} /></button><button className="icon-button danger-hover" onClick={() => deleteProduct(product)} title="Dar de baja" aria-label={`Dar de baja ${product.nombre}`}><Trash2 size={16} /></button></div></td>
          </tr>)}
        </tbody></table></div> : <EmptyState title="No hay productos" body={search ? 'Prueba con otro término de búsqueda.' : 'Crea el primer producto con el formulario.'} />}
      </section>
      <section className="panel form-panel" id="product-form">
        <div className="panel-heading form-panel-heading"><div><span className="form-kicker">{editing ? 'MODIFICACIÓN' : 'ALTA'}</span><h2>{editing ? 'Editar producto' : 'Nuevo producto'}</h2></div>{editing && <button className="icon-button" onClick={resetForm} title="Cancelar edición"><X size={17} /></button>}</div>
        <form className="stack-form" onSubmit={submitProduct}>
          <Field label="Nombre" name="nombre" value={form.nombre} onChange={changeField} placeholder="Ej. Yerba 1kg" required maxLength={50} />
          <Field label="Categoría" name="categoria" value={form.categoria} onChange={changeField} placeholder="Ej. Almacén" required maxLength={30} />
          <div className="form-row"><Field label="Precio de costo" name="precioCosto" type="number" min="0" step="0.01" value={form.precioCosto} onChange={changeField} required /><Field label="Precio de venta" name="precioVenta" type="number" min="0" step="0.01" value={form.precioVenta} onChange={changeField} required /></div>
          <div className="form-row"><Field label="Stock actual" name="stockActual" type="number" min="0" step="1" value={form.stockActual} onChange={changeField} /><Field label="Stock mínimo" name="stockMinimo" type="number" min="0" step="1" value={form.stockMinimo} onChange={changeField} /></div>
          <div className="form-actions"><button type="submit" className="button primary" disabled={saving}>{saving ? 'Guardando...' : <>{editing ? <Check size={16} /> : <Plus size={16} />}{editing ? 'Guardar cambios' : 'Crear producto'}</>}</button>{editing && <button type="button" className="button text-button" onClick={resetForm}>Cancelar</button>}</div>
        </form>
      </section>
    </div>
  </>
}

export default ProductsPage