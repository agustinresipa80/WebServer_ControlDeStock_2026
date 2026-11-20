const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
  })
  const text = await response.text()
  let body
  try { body = text ? JSON.parse(text) : null } catch { body = text }
  if (!response.ok) throw new Error(body?.error || body?.message || `Error HTTP ${response.status}`)
  return body
}