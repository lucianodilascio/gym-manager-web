import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { Plus, Search, Edit, Trash2, X, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Socios() {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    telefono: '',
    vencimiento: '',
    plan: '--' 
  });

  useEffect(() => {
    cargarSocios();
  }, []);

  const cargarSocios = async () => {
    try {
      const sociosRef = collection(db, "socios");
      const sociosSnap = await getDocs(sociosRef);
      const listaSocios = sociosSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Ordenar alfabéticamente
      listaSocios.sort((a, b) => a.nombre.localeCompare(b.nombre));
      
      setSocios(listaSocios); 
    } catch (error) {
      console.error("Error al cargar socios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const abrirModalNuevo = () => {
    setEditingId(null);
    setFormData({ nombre: '', dni: '', telefono: '', vencimiento: '', plan: '--' });
    setIsModalOpen(true);
  };

  const abrirModalEdicion = (socio) => {
    setEditingId(socio.id);
    setFormData({
      nombre: socio.nombre || '',
      dni: socio.dni || '',
      telefono: socio.telefono || '',
      vencimiento: socio.vencimiento || '',
      plan: socio.plan || '--'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const socioRef = doc(db, "socios", editingId);
        await updateDoc(socioRef, formData);
        setSocios(socios.map(s => s.id === editingId ? { ...s, ...formData } : s));
        Swal.fire({ icon: 'success', title: 'Socio actualizado', showConfirmButton: false, timer: 1500 });
      } else {
        const docRef = await addDoc(collection(db, "socios"), formData);
        setSocios([...socios, { id: docRef.id, ...formData }].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        Swal.fire({ icon: 'success', title: 'Socio agregado', showConfirmButton: false, timer: 1500 });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      Swal.fire('Error', 'Hubo un error al guardar los datos.', 'error');
    }
  };

  const handleDelete = async (id, nombre) => {
    const result = await Swal.fire({
      title: `¿Eliminar a ${nombre}?`,
      text: "Se borrarán todos sus datos del sistema de forma permanente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "socios", id));
        setSocios(socios.filter(s => s.id !== id));
        Swal.fire({ icon: 'success', title: 'Socio eliminado', showConfirmButton: false, timer: 1500 });
      } catch (error) {
        console.error("Error al eliminar:", error);
        Swal.fire('Error', 'No se pudo eliminar al socio.', 'error');
      }
    }
  };

  const handleRenovarCuota = async (socio) => {
    const result = await Swal.fire({
      title: `¿Renovar cuota de ${socio.nombre}?`,
      text: "Se sumará 1 mes de acceso automáticamente.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, renovar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); 

        let fechaBase = hoy;

        if (socio.vencimiento) {
          const [year, month, day] = socio.vencimiento.split('-');
          const vencActual = new Date(year, month - 1, day);
          
          if (vencActual > hoy) {
            fechaBase = vencActual;
          }
        }

        fechaBase.setMonth(fechaBase.getMonth() + 1);
        
        const nuevoVencimiento = fechaBase.toISOString().split('T')[0];

        const socioRef = doc(db, "socios", socio.id);
        await updateDoc(socioRef, { vencimiento: nuevoVencimiento });

        setSocios(socios.map(s => s.id === socio.id ? { ...s, vencimiento: nuevoVencimiento } : s));
        
        Swal.fire({ icon: 'success', title: 'Pago registrado', text: `Nuevo vencimiento: ${nuevoVencimiento}`, showConfirmButton: false, timer: 2000 });
      } catch (error) {
        console.error("Error al renovar:", error);
        Swal.fire('Error', 'Hubo un error al procesar el pago.', 'error');
      }
    }
  };

  const getEstadoBadge = (fecha) => {
    if (!fecha) return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold">SIN FECHA</span>;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const [year, month, day] = fecha.split('-');
    const venc = new Date(year, month - 1, day);
    
    const diffTime = venc - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold tracking-wide">VENCIDO</span>;
    if (diffDays <= 3) return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold tracking-wide">POR VENCER</span>;
    return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold tracking-wide">AL DÍA</span>;
  };

  // --- FUNCIÓN PARA FORMATEAR EL DNI VISUALMENTE ---
  const formatearDNI = (dni) => {
    if (!dni) return '-';
    // Esta expresión regular le agrega un punto cada 3 números desde el final
    return dni.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const sociosFiltrados = socios.filter((socio) => {
    const busq = busqueda.toLowerCase();
    // Le quitamos los puntos a la búsqueda por si Mari tipea "41.2" en lugar de "412"
    const busqDniLimpio = busq.replace(/\./g, ''); 
    
    const coincideNombre = socio.nombre.toLowerCase().includes(busq);
    const coincideDni = socio.dni ? socio.dni.includes(busqDniLimpio) : false;
    return coincideNombre || coincideDni;
  });

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando base de socios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Socios</h1>
          <p className="text-gray-500 mt-1">Administrá la información y cuotas de tus alumnos.</p>
        </div>
        <button 
          onClick={abrirModalNuevo} 
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
        >
          <Plus size={20} /> Nuevo Socio
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar socio por nombre o DNI..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow bg-gray-50 focus:bg-white" 
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-bold text-gray-700">Nombre</th>
                <th className="p-4 font-bold text-gray-700">DNI</th>
                <th className="p-4 font-bold text-gray-700">Plan Actual</th>
                <th className="p-4 font-bold text-gray-700">Vencimiento</th>
                <th className="p-4 font-bold text-gray-700 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sociosFiltrados.length > 0 ? (
                sociosFiltrados.map(socio => (
                  <tr key={socio.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{socio.nombre}</div>
                    </td>
                    <td className="p-4">
                      {/* APLICAMOS EL FORMATO AL DNI AQUÍ */}
                      <div className="text-sm text-gray-800 font-medium">{formatearDNI(socio.dni)}</div>
                    </td>
                    <td className="p-4 font-medium text-gray-700">
                      {socio.plan}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-sm font-medium text-gray-700">{socio.vencimiento ? socio.vencimiento.split('-').reverse().join('/') : '-'}</span>
                        {getEstadoBadge(socio.vencimiento)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleRenovarCuota(socio)} 
                          title="Registrar pago (1 mes)"
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200 rounded-lg transition-colors flex items-center justify-center group"
                        >
                          <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                        </button>

                        <button 
                          onClick={() => abrirModalEdicion(socio)} 
                          title="Editar socio"
                          className="p-2 bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <Edit size={18} />
                        </button>

                        <button 
                          onClick={() => handleDelete(socio.id, socio.nombre)} 
                          title="Eliminar socio"
                          className="p-2 bg-white text-red-500 hover:bg-red-50 border border-red-100 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    No se encontraron socios con ese nombre o DNI.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR / EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Editar Socio' : 'Nuevo Socio'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                  <input type="number" name="dni" value={formData.dni} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="Sin puntos" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento de Cuota</label>
                <input type="date" name="vencimiento" required value={formData.vencimiento} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Actual</label>
                <input type="text" value={formData.plan} disabled className="w-full p-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed" title="El plan se asigna automáticamente al inscribir al alumno en una clase." />
                <p className="text-xs text-gray-400 mt-1">El plan se vincula automáticamente desde la pestaña Clases.</p>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium shadow-sm">{editingId ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}