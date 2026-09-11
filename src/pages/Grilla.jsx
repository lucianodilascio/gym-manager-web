import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { Calendar, Users, Plus, X, Trash2, Printer } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Grilla() {
  const [clases, setClases] = useState([]);
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Modal de creación rápida
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', horario: '', profesor: '', cupo: '', dias: []
  });

  // Estados para la Lista de Presentes
  const [isListaModalOpen, setIsListaModalOpen] = useState(false);
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // 1. Cargamos las clases
      const clasesRef = collection(db, "clases");
      const clasesSnap = await getDocs(clasesRef);
      const listaClases = clasesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClases(listaClases);

      // 2. Cargamos los socios (necesario para ver los nombres en la lista de presentes)
      const sociosRef = collection(db, "socios");
      const sociosSnap = await getDocs(sociosRef);
      const listaSocios = sociosSnap.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombre,
        vencimiento: doc.data().vencimiento
      }));
      setSocios(listaSocios);

    } catch (error) {
      console.error("Error al cargar la grilla:", error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerHorariosUnicos = () => {
    const horarios = clases.map(c => c.horario);
    const horariosUnicos = [...new Set(horarios)];
    return horariosUnicos.sort((a, b) => a.localeCompare(b));
  };

  const obtenerClasesPorCelda = (dia, horario) => {
    return clases.filter(c => c.horario === horario && (c.dias || []).includes(dia));
  };

  // LÓGICA DEL FORMULARIO RÁPIDO 
  
  const abrirModalNuevo = (diaPredefinido = null, horarioPredefinido = '') => {
    setFormData({ 
      nombre: '', 
      horario: horarioPredefinido, 
      profesor: '', 
      cupo: '', 
      dias: diaPredefinido ? [diaPredefinido] : [] 
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDiaChange = (dia) => {
    setFormData(prev => {
      const diasActuales = prev.dias || [];
      if (diasActuales.includes(dia)) {
        return { ...prev, dias: diasActuales.filter(d => d !== dia) };
      } else {
        return { ...prev, dias: [...diasActuales, dia] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.dias.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Faltan días', text: 'Seleccioná al menos un día.'});
      return;
    }

    try {
      const datosGuardar = {
        ...formData,
        cupo: Number(formData.cupo),
        inscriptos: 0,
        listaInscriptos: []
      };

      const docRef = await addDoc(collection(db, "clases"), datosGuardar);
      setClases([...clases, { id: docRef.id, ...datosGuardar }]);
      setIsModalOpen(false);
      Swal.fire({ icon: 'success', title: 'Clase agregada', showConfirmButton: false, timer: 1500 });
    } catch (error) {
      console.error("Error al guardar:", error);
      Swal.fire('Error', 'No se pudo crear la clase.', 'error');
    }
  };

  const handleDelete = async (id, nombreClase) => {
    const result = await Swal.fire({
      title: `¿Eliminar ${nombreClase}?`,
      text: "Se borrará este turno de la grilla.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "clases", id));
        setClases(clases.filter(c => c.id !== id));
        Swal.fire({ icon: 'success', title: 'Turno eliminado', showConfirmButton: false, timer: 1500 });
      } catch (error) {
        console.error("Error al eliminar:", error);
        Swal.fire('Error', 'No se pudo eliminar el turno.', 'error');
      }
    }
  };

  // LÓGICA DE LISTA DE PRESENTES 
  const abrirModalLista = (clase) => {
    setClaseSeleccionada(clase);
    setIsListaModalOpen(true);
  };

  const estaVencido = (fecha) => {
    if (!fecha) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const [year, month, day] = fecha.split('-');
    const venc = new Date(year, month - 1, day);
    return venc < hoy;
  };

  const horarios = obtenerHorariosUnicos();

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando grilla semanal...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Grilla Semanal</h1>
          <p className="text-gray-500 mt-1">Vista general de turnos y espacios libres.</p>
        </div>
        <div className="flex gap-3">
          {/* BOTÓN IMPRIMIR */}
          <button 
            onClick={() => window.print()} 
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
            title="Imprimir o guardar como PDF"
          >
            <Printer size={20} /> Imprimir
          </button>
          <button 
            onClick={() => abrirModalNuevo()} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
          >
            <Plus size={20} /> Nueva Clase
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto print:shadow-none print:border-none">
        <table className="w-full text-left border-collapse min-w-[800px] print:min-w-full">
          <thead>
            <tr>
              <th className="p-4 bg-gray-50 border-b border-r border-gray-200 font-bold text-gray-700 w-24 text-center print:bg-transparent">
                <Calendar size={20} className="mx-auto mb-1 text-emerald-600 print:hidden" />
                Horario
              </th>
              {diasSemana.map(dia => (
                <th key={dia} className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 text-center print:bg-transparent">
                  {dia}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {horarios.length > 0 ? (
              horarios.map(horario => (
                <tr key={horario} className="hover:bg-gray-50/50">
                  <td className="p-4 font-bold text-gray-800 border-r border-gray-100 text-center align-top bg-gray-50/30 print:bg-transparent">
                    {horario} hs
                  </td>
                  
                  {diasSemana.map(dia => {
                    const clasesEnCelda = obtenerClasesPorCelda(dia, horario);
                    
                    return (
                      <td key={`${horario}-${dia}`} className="p-2 border-r border-gray-100 last:border-r-0 align-top min-w-[140px] h-full">
                        {clasesEnCelda.length > 0 ? (
                          <div className="space-y-2 h-full">
                            {clasesEnCelda.map(clase => {
                              const estaLleno = Number(clase.inscriptos) >= Number(clase.cupo);
                              return (
                                // CLASE CLICKEABLE
                                <div 
                                  key={clase.id} 
                                  onClick={() => abrirModalLista(clase)}
                                  className={`p-3 rounded-lg border flex flex-col gap-1 transition-all relative group/card cursor-pointer hover:shadow-md print:break-inside-avoid print:border-gray-400 ${estaLleno ? 'bg-red-50/50 border-red-200 print:bg-transparent' : 'bg-emerald-50/50 border-emerald-200 shadow-sm print:bg-transparent'}`}
                                >
                                  {/* Botón de eliminar (Aparece al pasar el mouse, se oculta al imprimir) */}
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation(); 
                                      handleDelete(clase.id, clase.nombre);
                                    }}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-50 group-hover/card:opacity-100 transition-opacity print:hidden"
                                    title="Eliminar clase"
                                  >
                                    <Trash2 size={14} />
                                  </button>

                                  <span className="font-bold text-sm text-gray-800 pr-5">{clase.nombre}</span>
                                  <span className="text-xs font-medium text-gray-600">Prof. {clase.profesor}</span>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="flex items-center gap-1 text-xs text-gray-500 font-medium"><Users size={12} /> {clase.inscriptos}/{clase.cupo}</span>
                                    {estaLleno && <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded print:bg-transparent print:border print:border-red-500">LLENA</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          // CAJA LIBRE ES UN BOTÓN CLICKEABLE (Se oculta al imprimir)
                          <div 
                            onClick={() => abrirModalNuevo(dia, horario)}
                            className="h-full min-h-[70px] rounded-lg border border-dashed border-gray-200 bg-transparent flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 transition-all group print:hidden"
                            title={`Crear clase el ${dia} a las ${horario}`}
                          >
                            <span className="text-xs font-medium group-hover:hidden">Libre</span>
                            <span className="text-xs font-bold hidden group-hover:flex items-center gap-1"><Plus size={14} /> Crear</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-12 text-center text-gray-500">
                  No hay clases programadas para generar la grilla.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CREACIÓN RÁPIDA (Se oculta al imprimir) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-gray-800">Nueva Clase</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Clase</label>
                <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="Ej: Pilates" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Días de la semana</label>
                <div className="grid grid-cols-3 gap-2">
                  {diasSemana.map(dia => (
                    <label key={dia} className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer text-sm font-medium transition-colors select-none ${(formData.dias || []).includes(dia) ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      <input type="checkbox" className="hidden" checked={(formData.dias || []).includes(dia)} onChange={() => handleDiaChange(dia)} />
                      {dia.substring(0, 3)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horario</label>
                  <input type="time" name="horario" required value={formData.horario} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cupo Máximo</label>
                  <input type="number" name="cupo" min="1" required value={formData.cupo} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="Ej: 10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profesor/a</label>
                <input type="text" name="profesor" required value={formData.profesor} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="Nombre del profe" />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium shadow-sm">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LISTA DE PRESENTES (Visualización rápida) */}
      {isListaModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-blue-100 bg-blue-50 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2"><Users size={24} /> Lista de Presentes</h2>
              <button onClick={() => setIsListaModalOpen(false)} className="text-blue-600 hover:text-blue-800 transition-colors"><X size={24} /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <p className="text-sm text-gray-600 mb-4">Clase: <span className="font-bold text-gray-900">{claseSeleccionada?.nombre} ({claseSeleccionada?.horario} hs)</span></p>
              <div className="space-y-2">
                {claseSeleccionada?.listaInscriptos?.length > 0 ? (
                  claseSeleccionada.listaInscriptos.map(idSocio => {
                    const socioInfo = socios.find(s => s.id === idSocio);
                    const debeMes = estaVencido(socioInfo?.vencimiento);

                    return (
                      <div key={idSocio} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-800">{socioInfo ? socioInfo.nombre : 'Socio eliminado'}</span>
                          {/* Muestra alerta si está anotado pero debe el mes */}
                          {debeMes && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold tracking-wide border border-red-200">
                              DEBE CUOTA
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-8 border border-dashed border-gray-200 rounded-xl text-gray-500 bg-gray-50 text-sm">No hay alumnos inscriptos en este turno todavía.</div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
              {/* botón sutil que los manda a la pestaña de Clases si quieren editar algo */}
              <button onClick={() => setIsListaModalOpen(false)} className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium shadow-sm">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}