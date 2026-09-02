import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Dumbbell, Settings, Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Leemos el nombre del gimnasio del localStorage (o usamos Gym Manager por defecto)
  const [nombreGym, setNombreGym] = useState(() => {
    return localStorage.getItem('nombreGym') || 'Gym Manager';
  });

  useEffect(() => {
    // Escuchamos el evento personalizado cuando se guardan los datos en configuración
    const handleGymNameChange = (e) => {
      if (e.detail) {
        setNombreGym(e.detail);
      }
    };

    window.addEventListener('gymNameChanged', handleGymNameChange);

    return () => {
      window.removeEventListener('gymNameChanged', handleGymNameChange);
    };
  }, []);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-gray-800 text-emerald-400' 
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <>
      {/* Botón hamburguesa visible solo en móviles */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Fondo oscuro al abrir el menú en móviles */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menú lateral con comportamiento responsive */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-64 bg-gray-900 text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 pt-20 md:pt-6">
          {/* Mostramos el nombre dinámico del gimnasio */}
          <h2 className="text-xl font-bold text-emerald-400 truncate" title={nombreGym}>
            {nombreGym}
          </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <NavLink to="/" className={navLinkClass} onClick={() => setIsOpen(false)}>
            <LayoutDashboard size={20} />
            <span>Panel Principal</span>
          </NavLink>
          
          <NavLink to="/socios" className={navLinkClass} onClick={() => setIsOpen(false)}>
            <Users size={20} />
            <span>Socios</span>
          </NavLink>

          <NavLink to="/clases" className={navLinkClass} onClick={() => setIsOpen(false)}>
            <Dumbbell size={20} />
            <span>Clases</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <NavLink 
            to="/configuracion" 
            className={navLinkClass} 
            onClick={() => setIsOpen(false)}
          >
            <Settings size={20} />
            <span>Configuración</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}