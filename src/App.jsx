import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Socios from './pages/Socios'
import Clases from './pages/Clases'
import Login from './pages/Login'
import Configuracion from './pages/Configuracion'

const ProtectedRoute = ({ isAuth, children }) => {
  if (!isAuth) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  // Inicializamos el estado leyendo el localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isLogged') === 'true';
  })

  // Función que se ejecuta al iniciar sesión con éxito
  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isLogged', 'true'); // Guardamos la sesión en el navegador
  }

  // Función para cerrar sesión (la usaremos más adelante en un botón)
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isLogged');
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={<Login onLogin={handleLogin} />} 
        />
        
        <Route 
          path="/*" 
          element={
            <ProtectedRoute isAuth={isAuthenticated}>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-4 pt-20 md:p-8 max-w-full overflow-hidden">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/socios" element={<Socios />} />
                    <Route path="/clases" element={<Clases />} />
                    <Route path="/configuracion" element={<Configuracion />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App