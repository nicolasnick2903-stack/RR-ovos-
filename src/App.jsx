import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SplashScreen from './components/SplashScreen.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppLayout from './components/AppLayout.jsx'
import { ToastProvider } from './hooks/useToast.jsx'
import { useAuth } from './hooks/useAuth.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Clientes from './pages/Clientes.jsx'
import ClienteDetalhe from './pages/ClienteDetalhe.jsx'
import NovoPedido from './pages/NovoPedido.jsx'
import Pedidos from './pages/Pedidos.jsx'
import Estoque from './pages/Estoque.jsx'
import Relatorios from './pages/Relatorios.jsx'
import Configuracoes from './pages/Configuracoes.jsx'

export default function App() {
  const { pronto } = useAuth()
  const [splash, setSplash] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1400)
    return () => clearTimeout(t)
  }, [])

  if (splash || !pronto) return <SplashScreen />

  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/:id" element={<ClienteDetalhe />} />
          <Route path="/novo-pedido" element={<NovoPedido />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  )
}
