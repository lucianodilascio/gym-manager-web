import { Search, Plus, MoreVertical, X, Edit2, Trash2 } from 'lucide-react';
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Socios() {
  const [socios, setSocios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para el Modal y Edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  
  // Estado para controlar qué menú desplegable está abierto
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    plan: 'Pase Libre',
    vencimiento: '',
    estado: 'Al día'
  });

  useEffect(() => {
    const obtenerSocios = async () => {
      const sociosRef = collection(db, "socios");
      const snapshot = await getDocs(sociosRef);
      const listaSocios = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSocios(listaSocios);
    };
    obtenerSocios();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const abrirModalNuevo = () => {
    setEditingId(null);
    setFormData({ nombre: '', dni: '', plan: 'Pase Libre', vencimiento: '', estado: 'Al día' });
    setIsModalOpen(true);
  };

  const abrirModalEdicion = (socio) => {
    setEditingId(socio.id);
    setFormData({
      nombre: socio.nombre,
      dni: socio.dni || '',
      plan: socio.plan || 'Pase Libre',
      vencimiento: socio.vencimiento,
      estado: socio.estado || 'Al día'
    });
    setActiveDropdown(null); 
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const socioRef = doc(db, "socios", editingId);
        await updateDoc(socioRef, formData);
        setSocios(socios.map(s => s.id === editingId ? { ...s, ...formData } : s));
      } else {
        const docRef = await addDoc(collection(db, "socios"), formData);
        setSocios([...socios, { id: docRef.id, ...formData }]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar los datos del socio");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que querés eliminar a este socio? Esta acción no se puede deshacer.")) {
      try {
        await deleteDoc(doc(db, "socios", id));
        setSocios(socios.filter(s => s.id !== id));
        setActiveDropdown(null);
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Hubo un error al eliminar el socio");
      }
    }
  };

  const sociosFiltrados = socios.filter((socio) => {
    const busqueda = searchTerm.toLowerCase();
    const coincideNombre = socio.nombre.toLowerCase().includes(busqueda);
    const coincideDni = socio.dni ? socio.dni.includes(busqueda) : false;
    return coincideNombre || coincideDni;
  });

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Socios</h1>
          <p className="text-gray-500 mt-1">Administrá las cuotas y datos de tus alumnos.</p>
        </div>
        <button 
          onClick={abrirModalNuevo}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nuevo Socio
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar socio por nombre o DNI..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
          />
        </div>
      </div>

      {/* Contenedor principal de la tabla corregido (min-h-[400px] y sin overflow) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[200px] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600">Nombre</th>
              <th className="p-4 font-semibold text-gray-600">DNI</th>
              <th className="p-4 font-semibold text-gray-600">Plan</th>
              <th className="p-4 font-semibold text-gray-600">Vencimiento</th>
              <th className="p-4 font-semibold text-gray-600">Estado</th>
              <th className="p-4 font-semibold text-gray-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sociosFiltrados.map((socio) => {
              let estadoBadge = socio.estado;
              if (socio.estado?.toLowerCase() === 'al dia') estadoBadge = 'Al día';
              
              return (
                <tr key={socio.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{socio.nombre}</td>
                  <td className="p-4 text-gray-600">{socio.dni || '-'}</td>
                  <td className="p-4 text-gray-600">{socio.plan || '-'}</td>
                  <td className="p-4 text-gray-600">{socio.vencimiento}</td>
                  <td className="p-4">
                    <span className={`inline-block whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold tracking-wide
                      ${estadoBadge === 'Al día' ? 'bg-emerald-100 text-emerald-700' : ''}
                      ${estadoBadge === 'Vencido' ? 'bg-red-100 text-red-700' : ''}
                      ${estadoBadge === 'Por vencer' ? 'bg-amber-100 text-amber-700' : ''}
                    `}>
                      {estadoBadge}
                    </span>
                  </td>
                  <td className="p-4 text-right relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === socio.id ? null : socio.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {/* Menú Desplegable elevado con z-50 y shadow-xl */}
                    {activeDropdown === socio.id && (
                      <div className="absolute right-8 top-10 w-36 bg-white border border-gray-100 rounded-lg shadow-xl z-50 overflow-hidden">
                        <button 
                          onClick={() => abrirModalEdicion(socio)}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        >
                          <Edit2 size={14} />
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(socio.id)}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-gray-50"
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {sociosFiltrados.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No se encontraron socios con esa búsqueda.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Editar Socio' : 'Agregar Nuevo Socio'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Ej: Lionel Messi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                <input 
                  type="text" 
                  name="dni"
                  required
                  value={formData.dni}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Sin puntos"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                  <select 
                    name="plan"
                    value={formData.plan}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Pase Libre">Pase Libre</option>
                    <option value="Musculación">Musculación</option>
                    <option value="Crossfit">Crossfit</option>
                    <option value="Boxeo">Boxeo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select 
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Al día">Al día</option>
                    <option value="Por vencer">Por vencer</option>
                    <option value="Vencido">Vencido</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento</label>
                <input 
                  type="date" 
                  name="vencimiento"
                  required
                  value={formData.vencimiento}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium shadow-sm"
                >
                  {editingId ? 'Guardar Cambios' : 'Guardar Socio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}