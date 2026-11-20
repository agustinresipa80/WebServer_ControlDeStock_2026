import { useState } from 'react'
import { Activity, AlertTriangle, ArrowDownToLine, CalendarDays, ChevronDown, CircleDollarSign, RefreshCw, Search } from 'lucide-react'
import { ReportProfitability, ReportReplenishment } from '../components/reports/ReportResults.jsx'
import Field from '../components/ui/Field.jsx'
import PageHeading from '../components/ui/PageHeading.jsx'
import { api } from '../services/api.js'

function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10)
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  const [report, setReport] = useState('rentabilidad')
  const [filters, setFilters] = useState({ desde: monthAgo, hasta: today, agrupar: 'producto', dias: 30, objetivo: 15 })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function updateFilter(event) { setFilters(current => ({ ...current, [event.target.name]: event.target.value })) }
  async function runReport(event) {
    event.preventDefault()
    setLoading(true); setError('')
    const params = report === 'rentabilidad'
      ? new URLSearchParams({ desde: filters.desde, hasta: filters.hasta, agrupar: filters.agrupar })
      : new URLSearchParams({ dias: filters.dias, objetivo: filters.objetivo })
    try { setResults(await api(`/reportes/${report}?${params}`)) }
    catch (requestError) { setError(requestError.message); setResults(null) }
    finally { setLoading(false) }
  }

  return <>
    <PageHeading eyebrow="ANÁLISIS · CONSULTAS GET" title="Reportes" description="Ejecuta consultas de rentabilidad y reposición contra la API." />
    <section className="panel report-panel">
      <div className="report-tabs" role="tablist" aria-label="Tipo de reporte">
        <button role="tab" aria-selected={report === 'rentabilidad'} className={report === 'rentabilidad' ? 'selected' : ''} onClick={() => { setReport('rentabilidad'); setResults(null); setError('') }}><CircleDollarSign size={17} />Rentabilidad</button>
        <button role="tab" aria-selected={report === 'reposicion'} className={report === 'reposicion' ? 'selected' : ''} onClick={() => { setReport('reposicion'); setResults(null); setError('') }}><ArrowDownToLine size={17} />Reposición</button>
      </div>
      <form className="report-filters" onSubmit={runReport}>
        {report === 'rentabilidad' ? <>
          <Field label="Desde" name="desde" type="date" value={filters.desde} onChange={updateFilter} required />
          <Field label="Hasta" name="hasta" type="date" value={filters.hasta} onChange={updateFilter} required />
          <label className="field"><span>Agrupar por</span><span className="select-wrap"><select name="agrupar" value={filters.agrupar} onChange={updateFilter}><option value="producto">Producto</option><option value="categoria">Categoría</option></select><ChevronDown size={15} /></span></label>
        </> : <>
          <Field label="Días analizados" name="dias" type="number" min="1" value={filters.dias} onChange={updateFilter} required />
          <Field label="Días objetivo" name="objetivo" type="number" min="1" value={filters.objetivo} onChange={updateFilter} required />
          <div className="filter-note"><CalendarDays size={16} /> Ventana de análisis de ventas</div>
        </>}
        <button type="submit" className="button primary run-button" disabled={loading}>{loading ? <RefreshCw className="spin" size={16} /> : <Search size={16} />}{loading ? 'Consultando...' : 'Ejecutar consulta'}</button>
      </form>
      <div className="results-heading"><div><span className="form-kicker">RESPUESTA DEL BACKEND</span><h2>{report === 'rentabilidad' ? 'Rentabilidad por ' + (filters.agrupar === 'producto' ? 'producto' : 'categoría') : 'Sugerencias de reposición'}</h2></div>{results && <span className="result-count">{results.length} resultados</span>}</div>
      {error && <div className="report-error"><AlertTriangle size={17} />{error}</div>}
      {!results && !error && !loading && <div className="report-empty"><div className="report-empty-icon"><Activity size={22} /></div><strong>Sin consulta ejecutada</strong><span>Configura los parámetros y ejecuta el reporte para ver la respuesta.</span></div>}
      {results && report === 'rentabilidad' && <ReportProfitability rows={results} />}
      {results && report === 'reposicion' && <ReportReplenishment rows={results} />}
    </section>
  </>
}

export default ReportsPage