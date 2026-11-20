function Metric({ icon, label, value, detail, warning = false }) {
  return (
    <div className="metric">
      <div className={`metric-icon ${warning ? 'warning' : ''}`}>{icon}</div>
      <div className="metric-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
    </div>
  )
}

export default Metric