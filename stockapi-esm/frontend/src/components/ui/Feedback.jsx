import { ClipboardList, RefreshCw } from 'lucide-react'

export function Loading() {
  return <div className="loading"><RefreshCw size={18} className="spin" />Cargando datos...</div>
}

export function EmptyState({ title, body }) {
  return <div className="empty-state"><div className="empty-icon"><ClipboardList size={20} /></div><strong>{title}</strong><span>{body}</span></div>
}