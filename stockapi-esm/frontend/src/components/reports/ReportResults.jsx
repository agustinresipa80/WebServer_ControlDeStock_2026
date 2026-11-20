import { money } from '../../services/formatters.js'
import { EmptyState } from '../ui/Feedback.jsx'

export function ReportProfitability({ rows }) {
  return rows.length ? <div className="table-scroll report-table"><table><thead><tr><th>GRUPO</th><th>UNIDADES</th><th>INGRESOS</th><th>COSTO</th><th>GANANCIA</th><th>MARGEN</th></tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.grupo}-${index}`}><td className="product-name">{row.grupo}</td><td>{row.unidades}</td><td>{money(row.ingresos)}</td><td>{money(row.costoTotal)}</td><td className="price-cell">{money(row.ganancia)}</td><td><span className="pill good">{row.margenPorcentaje}%</span></td></tr>)}</tbody></table></div> : <EmptyState title="Sin datos para el período" body="No se encontraron ventas activas con esos parámetros." />
}

export function ReportReplenishment({ rows }) {
  return rows.length ? <div className="table-scroll report-table"><table><thead><tr><th>PRODUCTO</th><th>STOCK</th><th>ROTACIÓN / DÍA</th><th>DÍAS RESTANTES</th><th>SUGERENCIA</th></tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.nombre}-${index}`}><td><div className="product-name">{row.nombre}</div><div className="sub-cell">{row.categoria}</div></td><td>{row.stockActual}</td><td>{Number(row.rotacionDiaria).toFixed(2)}</td><td>{row.diasRestantes == null ? '—' : Number(row.diasRestantes).toFixed(1)}</td><td className="price-cell">{row.cantidadSugerida} u.</td></tr>)}</tbody></table></div> : <EmptyState title="No hay productos para reponer" body="El stock actual cubre la demanda estimada." />
}