import { Users, CreditCard, Activity, AlertCircle, TrendingUp, CalendarDays } from 'lucide-react';
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function Dashboard() {
  const [metricas, setMetricas] = useState({
    totalSocios: 0,
    sociosActivos: 0,
    sociosVencidos: 0,
    cargando: true
  });
  
  const [clasesHoy, setClasesHoy] = useState([]);
  const [ultimosSocios, setUltimosSocios] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // 1. Traer datos de Socios
        const sociosRef = collection(db, "socios");
        const sociosSnap = await getDocs(sociosRef);
        
        let total = 0;
        let activos = 0;
        let vencidos = 0;
        const listaSocios = [];

        sociosSnap.docs.forEach(doc => {
          total++;
          const data = doc.data();
          listaSocios.push({ id: doc.id, ...data });

          // Usamos la misma lógica que en Socios para contar activos y vencidos
          if (data.vencimiento) {
             const hoy = new Date();
             hoy.setHours(0, 0, 0, 0);
             const [anio, mes, dia] = data.vencimiento.split('-');
             const venc = new Date(anio, mes - 1, dia);
             venc.setHours(0, 0, 0, 0);
             
             const diferenciaDias = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
             
             if (diferenciaDias < 0) vencidos++;
             else activos++;
          }
        });

        setMetricas({
          totalSocios: total,
          sociosActivos: activos,
          sociosVencidos: vencidos,
          cargando: false
        });

        // Ordenar por ID o fecha de creación si la tuvieras para ultimos movimientos
        // Por ahora invertimos la lista para simular los más recientes
        setUltimosSocios(listaSocios.reverse().slice(0, 4));

        // 2. Traer datos de Clases
        const clasesRef = collection(db, "clases");
        const clasesSnap = await getDocs(clasesRef);
        
        const listaClases = clasesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        listaClases.sort((a, b) => a.horario.localeCompare(b.horario));
        setClasesHoy(listaClases.slice(0, 4));

      } catch (error) {
        console.error("Error al obtener datos:", error);
        setMetricas(prev => ({ ...prev, cargando: false }));
      }
    };

    cargarDatos();
  }, []);

  // Función compartida para formatear los días
  const formatearDias = (diasArray) => {
    if (!diasArray || diasArray.length === 0) return "Días no asignados";
    const nombresCortos = {
      'Lunes': 'Lun', 'Martes': 'Mar', 'Miércoles': 'Mié', 
      'Jueves': 'Jue', 'Viernes': 'Vie', 'Sábado': 'Sáb'
    };
    const orden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diasOrdenados = [...diasArray].sort((a, b) => orden.indexOf(a) - orden.indexOf(b));
    return diasOrdenados.map(d => nombresCortos[d]).join(' - ');
  };

  // Función matemática para sacar el estado de los últimos movimientos al vuelo
  const obtenerEstadoString = (fechaVencimientoStr) => {
    if (!fechaVencimientoStr) return 'Al día';
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const [anio, mes, dia] = fechaVencimientoStr.split('-');
    const vencimiento = new Date(anio, mes - 1, dia);
    vencimiento.setHours(0, 0, 0, 0);
    const diferenciaDias = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));

    if (diferenciaDias < 0) return 'Vencido';
    if (diferenciaDias <= 3) return 'Por vencer';
    return 'Al día';
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Panel Principal</h1>
        <p className="text-gray-500 mt-1">Resumen general del gimnasio al día de hoy.</p>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-blue-100 p-4 rounded-lg text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Socios</p>
            <p className="text-2xl font-bold text-gray-800">
              {metricas.cargando ? '...' : metricas.totalSocios}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-emerald-100 p-4 rounded-lg text-emerald-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Socios al Día</p>
            <p className="text-2xl font-bold text-gray-800">
              {metricas.cargando ? '...' : metricas.sociosActivos}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-red-100 p-4 rounded-lg text-red-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Cuotas Vencidas</p>
            <p className="text-2xl font-bold text-gray-800">
              {metricas.cargando ? '...' : metricas.sociosVencidos}
            </p>
          </div>
        </div>
      </div>

      {/* Sección inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Clases de hoy */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-emerald-500" />
            CLASES DISPONIBLES
          </h2>
          <div className="space-y-3">
            {clasesHoy.length > 0 ? (
              clasesHoy.map(clase => {
                const cupo = Number(clase.cupo) || 1;
                const inscriptos = Number(clase.inscriptos) || 0;
                const estaLleno = inscriptos >= cupo;

                return (
                  <div key={clase.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-800">{clase.nombre}</p>
                      <p className="text-sm text-gray-500">{clase.horario} hs - Prof. {clase.profesor}</p>
                      {/* ACÁ AGREGAMOS LOS DÍAS */}
                      <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1 bg-emerald-50 w-fit px-2 py-0.5 rounded">
                        <CalendarDays size={12} />
                        <span>{formatearDias(clase.dias)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium px-3 py-1 rounded-full ${estaLleno ? 'text-red-600 bg-red-100' : 'text-emerald-600 bg-emerald-100'}`}>
                        {estaLleno ? `${inscriptos}/${cupo} Lleno` : `${inscriptos}/${cupo} lugares`}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-4 text-gray-500 text-sm">
                No hay clases programadas.
              </div>
            )}
          </div>
        </div>

        {/* Últimos Movimientos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-blue-500" />
            Últimos Movimientos
          </h2>
          <div className="space-y-3">
            {ultimosSocios.length > 0 ? (
              ultimosSocios.map(socio => {
                const estadoTexto = obtenerEstadoString(socio.vencimiento);
                const estaAlDia = estadoTexto === 'Al día';
                const estaVencido = estadoTexto === 'Vencido';

                return (
                  <div key={socio.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${estaAlDia ? 'bg-emerald-500' : estaVencido ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                      <div>
                        <p className="font-semibold text-gray-800">{socio.nombre}</p>
                        <p className="text-sm text-gray-500">{socio.plan || '--'}</p>
                      </div>
                    </div>
                    <p className={`font-semibold text-sm ${estaAlDia ? 'text-emerald-600' : estaVencido ? 'text-red-600' : 'text-amber-600'}`}>
                      {estadoTexto}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-4 text-gray-500 text-sm">
                No hay movimientos recientes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}