import { Plus, Users, Clock, Edit, Trash2, UserPlus, X, Search, CalendarDays } from 'lucide-react';
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import Swal from 'sweetalert2';

export default function Clases() {
  const [clases, setClases] = useState([]);
  const [socios, setSocios] = useState([]); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isListaModalOpen, setIsListaModalOpen] = useState(false);
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);
  const [socioAInscribir, setSocioAInscribir] = useState('');
  const [busquedaSocio, setBusquedaSocio] = useState('');

  // 1. AÑADIMOS EL CAMPO 'dias' AL ESTADO DEL FORMULARIO
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  const [formData, setFormData] = useState({
    nombre: '',
    horario: '',
    profesor: '',
    cupo: '',
    dias: [] // Array para guardar los días seleccionados
  });

  useEffect(() => {
    const cargarDatos = async () => {
      const clasesRef = collection(db, "clases");
      const clasesSnap = await getDocs(clasesRef);
      const listaClases = clasesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      listaClases.sort((a, b) => a.horario.localeCompare(b.horario));
      setClases(listaClases);

      const sociosRef = collection(db, "socios");
      const sociosSnap = await getDocs(sociosRef);
      const listaSocios = sociosSnap.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombre,
        estado: doc.data().estado,
        plan: doc.data().plan // Aseguramos traer el plan para la lógica de suma
      }));
      listaSocios.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setSocios(listaSocios);
    };
    
    cargarDatos();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. LÓGICA PARA MANEJAR LOS CHECKBOXES DE LOS DÍAS
  const handleDiaChange = (dia) => {
    setFormData(prev => {
      const diasActuales = prev.dias || [];
      if (diasActuales.includes(dia)) {
        return { ...prev, dias: diasActuales.filter(d => d !== dia) }; // Si ya está, lo saca
      } else {
        return { ...prev, dias: [...diasActuales, dia] }; // Si no está, lo agrega
      }
    });
  };

  const abrirModalNuevo = () => {
    setEditingId(null);
    setFormData({ nombre: '', horario: '', profesor: '', cupo: '', dias: [] });
    setIsModalOpen(true);
  };

  const abrirModalEdicion = (clase) => {
    setEditingId(clase.id);
    setFormData({
      nombre: clase.nombre || '',
      horario: clase.horario,
      profesor: clase.profesor,
      cupo: clase.cupo,
      dias: clase.dias || [] // Cargamos los días si ya los tenía
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.dias.length === 0) {
      alert("Por favor, seleccioná al menos un día de la semana.");
      return;
    }

    try {
      const datosGuardar = {
        ...formData,
        cupo: Number(formData.cupo)
      };

      if (editingId) {
        const claseRef = doc(db, "clases", editingId);
        await updateDoc(claseRef, datosGuardar);
        setClases(clases.map(c => c.id === editingId ? { ...c, ...datosGuardar } : c));
      } else {
        datosGuardar.inscriptos = 0; 
        datosGuardar.listaInscriptos = [];
        const docRef = await addDoc(collection(db, "clases"), datosGuardar);
        setClases([...clases, { id: docRef.id, ...datosGuardar }].sort((a, b) => a.horario.localeCompare(b.horario)));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar el turno");
    }
  };

 const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar este turno?',
      text: "Esta acción no se puede deshacer.",
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

  const abrirModalInscripcion = (clase) => {
    setClaseSeleccionada(clase);
    setSocioAInscribir('');
    setBusquedaSocio(''); 
    setIsEnrollModalOpen(true);
  };

  const handleInscribir = async (e) => {
    e.preventDefault();
    if (!socioAInscribir) return;

    const socioInfo = socios.find(s => s.id === socioAInscribir);
    const clasesDelSocio = clases.filter(c => (c.listaInscriptos || []).includes(socioAInscribir));
    
    const haySuperposicion = clasesDelSocio.some(c => {
      const mismoHorario = c.horario === claseSeleccionada.horario;
      const diasCompartidos = (c.dias || []).some(dia => (claseSeleccionada.dias || []).includes(dia));
      return mismoHorario && diasCompartidos;
    });

    if (haySuperposicion) {
      Swal.fire({
        icon: 'error',
        title: 'Choque de horarios',
        text: 'Este alumno ya tiene otra clase en el mismo horario y día(s).',
        confirmButtonColor: '#10b981' // Verde esmeralda de Tailwind
      });
      return;
    }

    try {
      const listaActual = claseSeleccionada.listaInscriptos || [];
      const nuevaLista = [...listaActual, socioAInscribir];
      const claseRef = doc(db, "clases", claseSeleccionada.id);
      
      await updateDoc(claseRef, { 
        listaInscriptos: nuevaLista,
        inscriptos: nuevaLista.length
      });
      
      let planActual = socioInfo?.plan || '--';
      let nuevoPlan = planActual === '--' 
        ? claseSeleccionada.nombre 
        : `${planActual} + ${claseSeleccionada.nombre}`;

      const socioRef = doc(db, "socios", socioAInscribir);
      await updateDoc(socioRef, { plan: nuevoPlan });

      setClases(clases.map(c => c.id === claseSeleccionada.id ? { ...c, listaInscriptos: nuevaLista, inscriptos: nuevaLista.length } : c));
      setSocios(socios.map(s => s.id === socioAInscribir ? { ...s, plan: nuevoPlan } : s));
      setIsEnrollModalOpen(false);
      
      // Opcional: Alerta de éxito pequeña
      Swal.fire({
        icon: 'success',
        title: 'Inscripto',
        showConfirmButton: false,
        timer: 1500
      });

    } catch (error) {
      console.error("Error al inscribir:", error);
      Swal.fire('Error', 'Hubo un error al anotar al alumno.', 'error');
    }
  };

  const abrirModalLista = (clase) => {
    setClaseSeleccionada(clase);
    setIsListaModalOpen(true);
  };

  const handleDarDeBaja = async (idSocioRemover) => {
    // Alerta de confirmación de SweetAlert
    const result = await Swal.fire({
      title: '¿Dar de baja?',
      text: "Vas a remover a este alumno de la clase.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', // Rojo de Tailwind
      cancelButtonColor: '#6b7280', // Gris
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const nuevaLista = (claseSeleccionada.listaInscriptos || []).filter(id => id !== idSocioRemover);
        const claseRef = doc(db, "clases", claseSeleccionada.id);
        
        await updateDoc(claseRef, { 
          listaInscriptos: nuevaLista,
          inscriptos: nuevaLista.length
        });

        const socioInfo = socios.find(s => s.id === idSocioRemover);
        let planActual = socioInfo?.plan || '--';
        let nuevoPlan = '--';
        
        if (planActual !== '--') {
          const planesArray = planActual.split(' + ').filter(p => p !== claseSeleccionada.nombre);
          nuevoPlan = planesArray.length > 0 ? planesArray.join(' + ') : '--';
        }

        const socioRef = doc(db, "socios", idSocioRemover);
        await updateDoc(socioRef, { plan: nuevoPlan });
        
        setClases(clases.map(c => c.id === claseSeleccionada.id ? { ...c, listaInscriptos: nuevaLista, inscriptos: nuevaLista.length } : c));
        setClaseSeleccionada(prev => ({ ...prev, listaInscriptos: nuevaLista, inscriptos: nuevaLista.length }));
        setSocios(socios.map(s => s.id === idSocioRemover ? { ...s, plan: nuevoPlan } : s));
        
      } catch (error) {
        console.error("Error al dar de baja:", error);
        Swal.fire('Error', 'Hubo un error al remover al alumno.', 'error');
      }
    }
  };

  // 3. FUNCIÓN PARA FORMATEAR LOS DÍAS EN LA TARJETA (Ej: Lunes, Miércoles -> Lun, Mié)
  const formatearDias = (diasArray) => {
    if (!diasArray || diasArray.length === 0) return "Días no asignados";
    
    // Mapeo para nombres cortos
    const nombresCortos = {
      'Lunes': 'Lun', 'Martes': 'Mar', 'Miércoles': 'Mié', 
      'Jueves': 'Jue', 'Viernes': 'Vie', 'Sábado': 'Sáb'
    };

    // Ordenamos cronológicamente
    const orden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diasOrdenados = [...diasArray].sort((a, b) => orden.indexOf(a) - orden.indexOf(b));

    return diasOrdenados.map(d => nombresCortos[d]).join(' - ');
  };

  // 4. Permitimos buscar socios que no estén en ESTA clase específica (sin importar si van a otras)
  const sociosDisponibles = socios.filter(s => !(claseSeleccionada?.listaInscriptos || []).includes(s.id));
  const sociosFiltrados = sociosDisponibles.filter(socio => socio.nombre.toLowerCase().includes(busquedaSocio.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Clases</h1>
          <p className="text-gray-500 mt-1">Administrá los horarios y la capacidad de los turnos.</p>
        </div>
        <button onClick={abrirModalNuevo} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
          <Plus size={20} /> Nueva Clase
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clases.map((clase) => {
          const cupoReal = Number(clase.cupo) || 1;
          const inscriptosReales = Number(clase.inscriptos) || 0;
          const porcentajeOcupacion = (inscriptosReales / cupoReal) * 100;
          const estaLleno = inscriptosReales >= cupoReal;

          return (
            <div key={clase.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="p-5 border-b border-gray-100 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{clase.nombre}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${estaLleno ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {estaLleno ? 'COMPLETO' : 'DISPONIBLE'}
                  </span>
                </div>
                
                <div className="space-y-2 mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span>{clase.horario} hs</span>
                  </div>
                  {/* 4. MOSTRAMOS LOS DÍAS EN LA TARJETA */}
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-gray-400" />
                    <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{formatearDias(clase.dias)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span>Prof. {clase.profesor}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-gray-50">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-medium text-gray-700">Ocupación</span>
                  <span className="font-bold text-gray-900">{inscriptosReales} / {cupoReal}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div className={`h-2 rounded-full ${estaLleno ? 'bg-red-500' : 'bg-emerald-500 transition-all duration-500'}`} style={{ width: `${Math.min(porcentajeOcupacion, 100)}%` }}></div>
                </div>

                <div className="flex gap-2 mb-3">
                  <button onClick={() => abrirModalInscripcion(clase)} disabled={estaLleno} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${estaLleno ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                    <UserPlus size={18} /> {estaLleno ? 'Llena' : 'Inscribir'}
                  </button>
                  <button onClick={() => abrirModalLista(clase)} className="flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100">
                    <Users size={18} /> Ver Lista
                  </button>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  <button onClick={() => abrirModalEdicion(clase)} className="flex-1 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(clase.id)} className="bg-white border border-gray-200 text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center justify-center"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          );
        })}
        {clases.length === 0 && (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-gray-100 border-dashed">
            <p className="text-gray-500 text-lg">No hay turnos creados todavía.</p>
            <p className="text-gray-400 text-sm mt-1">Hacé clic en "Nueva Clase" para empezar a armar tu grilla.</p>
          </div>
        )}
      </div>

      {/* 5. MODIFICAMOS EL MODAL DE CREAR/EDITAR PARA AÑADIR LOS CHECKBOXES */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Editar Clase' : 'Nueva Clase'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Clase</label>
                <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="Ej: Pilates" />
              </div>

              {/* SECCIÓN DE DÍAS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Días de la semana</label>
                <div className="grid grid-cols-3 gap-2">
                  {diasSemana.map(dia => (
                    <label key={dia} className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer text-sm font-medium transition-colors select-none
                      ${(formData.dias || []).includes(dia) 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={(formData.dias || []).includes(dia)}
                        onChange={() => handleDiaChange(dia)}
                      />
                      {dia.substring(0, 3)} {/* Muestra solo "Lun", "Mar", etc */}
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
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium shadow-sm">{editingId ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal INSCRIBIR (sin cambios) */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-emerald-100 bg-emerald-50 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-emerald-800 flex items-center gap-2"><UserPlus size={24} /> Anotar Alumno</h2>
              <button onClick={() => setIsEnrollModalOpen(false)} className="text-emerald-600 hover:text-emerald-800 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleInscribir} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 flex-1 overflow-hidden flex flex-col space-y-4">
                <p className="text-sm text-gray-600 shrink-0">Seleccioná al alumno para la clase de <span className="font-bold text-gray-900">{claseSeleccionada?.nombre} ({claseSeleccionada?.horario} hs)</span>.</p>
                <div className="relative shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Buscar por nombre..." value={busquedaSocio} onChange={(e) => setBusquedaSocio(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow bg-gray-50 focus:bg-white" />
                </div>
                <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                  {sociosFiltrados.length > 0 ? (
                    sociosFiltrados.map(socio => (
                      <div key={socio.id} onClick={() => setSocioAInscribir(socio.id)} className={`p-3 border-b border-gray-100 last:border-0 cursor-pointer transition-colors flex justify-between items-center ${socioAInscribir === socio.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}>
                        <span className={`font-medium ${socioAInscribir === socio.id ? 'text-emerald-700' : 'text-gray-700'}`}>{socio.nombre}</span>
                        {socio.estado?.toLowerCase() === 'vencido' && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-md font-bold tracking-wide">⚠️ Vencida</span>}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500 text-sm">{sociosDisponibles.length === 0 ? "Todos los alumnos ya están inscriptos en esta clase." : "No se encontraron alumnos con ese nombre."}</div>
                  )}
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsEnrollModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium">Cancelar</button>
                <button type="submit" disabled={!socioAInscribir} className={`px-6 py-2 text-white rounded-lg transition-colors font-medium shadow-sm flex items-center gap-2 ${socioAInscribir ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-emerald-300 cursor-not-allowed'}`}>Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal VER LISTA (sin cambios) */}
      {isListaModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                    return (
                      <div key={idSocio} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <span className="font-medium text-gray-800">{socioInfo ? socioInfo.nombre : 'Socio eliminado del sistema'}</span>
                        <button onClick={() => handleDarDeBaja(idSocio)} className="text-red-500 hover:text-red-700 p-1.5 bg-white border border-red-100 hover:bg-red-50 rounded-lg transition-colors shadow-sm flex items-center gap-2 text-sm font-medium" title="Dar de baja"><X size={16} /> Quitar</button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-8 border border-dashed border-gray-200 rounded-xl text-gray-500 bg-gray-50 text-sm">No hay alumnos inscriptos en este turno todavía.</div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
              <button onClick={() => setIsListaModalOpen(false)} className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium shadow-sm">Cerrar Lista</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}