import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import SalesPage from './pages/SalesPage.jsx'

function AppRoot() {
  const location = useLocation()
  const [notice, setNotice] = useState(null)

  useEffect(() => setNotice(null), [location.pathname])

  function notify(message, type = 'success') {
    setNotice({ message, type })
    window.setTimeout(() => setNotice(null), 4200)
  }

  return (
    <Routes>
      <Route element={<AppLayout notice={notice} dismissNotice={() => setNotice(null)} />}>
        <Route path="/" element={<Navigate to="/productos" replace />} />
        <Route path="/productos" element={<ProductsPage notify={notify} />} />
        <Route path="/ventas" element={<SalesPage notify={notify} />} />
        <Route path="/reportes" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/productos" replace />} />
      </Route>
    </Routes>
  )
}

export default AppRoot