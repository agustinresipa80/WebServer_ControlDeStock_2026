export const money = value => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2
}).format(Number(value) || 0)

export const formatDate = value => value
  ? new Date(value).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })
  : '—'