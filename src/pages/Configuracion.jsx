import { useState } from 'react';
import { Save, Key, Building, Eye, EyeOff } from 'lucide-react';

export default function Configuracion() {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  // Estados iniciales leyendo del localStorage
  const [nombreGym, setNombreGym] = useState(() => {
    return localStorage.getItem('nombreGym') || 'Gym Manager';
  });
  const [telefonoGym, setTelefonoGym] = useState(() => {
    return localStorage.getItem('telefonoGym') || '';
  });

  const handleGuardarDatosGym = (e) => {
    e.preventDefault();
    // Guardamos en el navegador
    localStorage.setItem('nombreGym', nombreGym);
    localStorage.setItem('telefonoGym', telefonoGym);

    // Disparamos un evento personalizado para que el Sidebar se entere al instante
    window.dispatchEvent(new CustomEvent('gymNameChanged', { detail: nombreGym }));

    alert('¡Datos del gimnasio guardados con éxito!');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Configuración</h1>
        <p className="text-gray-500 mt-1">Administrá los datos de tu cuenta y del gimnasio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel 1: Seguridad (Lo dejamos como estaba) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Key className="text-emerald-500" size={24} />
            Seguridad de la Cuenta
          </h2>
          <form className="space-y-4 flex-1 flex flex-col">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico (Solo lectura)</label>
              <input 
                type="email" 
                value="admin@gym.com" 
                disabled 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
              <div className="relative">
                <input 
                  type={mostrarPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" 
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
              <div className="relative">
                <input 
                  type={mostrarConfirmar ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" 
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {mostrarConfirmar ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="mt-auto pt-4">
              <button type="button" className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full flex justify-center items-center gap-2">
                <Save size={20} />
                Actualizar Contraseña
              </button>
            </div>
          </form>
        </div>

        {/* Panel 2: Datos del Gimnasio (AHORA DINÁMICO) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Building className="text-emerald-500" size={24} />
            Datos del Gimnasio
          </h2>
          <form onSubmit={handleGuardarDatosGym} className="space-y-4 flex-1 flex flex-col">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Gimnasio</label>
              <input 
                type="text" 
                value={nombreGym}
                onChange={(e) => setNombreGym(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" 
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de Contacto (WhatsApp)</label>
              <input 
                type="text" 
                value={telefonoGym}
                onChange={(e) => setTelefonoGym(e.target.value)}
                placeholder="+54 9 11 1234-5678" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" 
              />
            </div>
            <div className="mt-auto pt-4">
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full flex justify-center items-center gap-2 shadow-sm">
                <Save size={20} />
                Guardar Datos
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}