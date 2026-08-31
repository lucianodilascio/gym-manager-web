import { Plus, Users, Clock, Edit, Trash2 } from 'lucide-react';

// Datos ficticios de las clases del día
const clasesMock = [
  { id: 1, nombre: "Crossfit", horario: "18:00 hs", profesor: "Carlos", inscriptos: 15, cupo: 20 },
  { id: 2, nombre: "Musculación", horario: "19:00 hs", profesor: "Ana", inscriptos: 20, cupo: 20 },
  { id: 3, nombre: "Boxeo", horario: "20:00 hs", profesor: "Diego", inscriptos: 8, cupo: 15 },
  { id: 4, nombre: "Yoga", horario: "09:00 hs", profesor: "Marta", inscriptos: 12, cupo: 12 },
  { id: 5, nombre: "Funcional", horario: "10:00 hs", profesor: "Carlos", inscriptos: 18, cupo: 25 },
];

export default function Clases() {
  return (
    <div className="space-y-6">
      {/* Encabezado y botón de acción */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Clases</h1>
          <p className="text-gray-500 mt-1">Administrá los horarios y la capacidad de los turnos.</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
          <Plus size={20} />
          Nueva Clase
        </button>
      </div>

      {/* Grilla de Tarjetas de Clases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clasesMock.map((clase) => {
          // Calculamos el porcentaje de ocupación para la barra visual
          const porcentajeOcupacion = (clase.inscriptos / clase.cupo) * 100;
          const estaLleno = clase.inscriptos >= clase.cupo;

          return (
            <div key={clase.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              
              {/* Cabecera de la tarjeta */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{clase.nombre}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${estaLleno ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {estaLleno ? 'COMPLETO' : 'DISPONIBLE'}
                  </span>
                </div>
                
                <div className="space-y-2 mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span>{clase.horario}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span>Prof. {clase.profesor}</span>
                  </div>
                </div>
              </div>

              {/* Sección de Capacidad y Barra de Progreso */}
              <div className="p-5 bg-gray-50">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-medium text-gray-700">Ocupación</span>
                  <span className="font-bold text-gray-900">{clase.inscriptos} / {clase.cupo}</span>
                </div>
                
                {/* Barra de progreso visual */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className={`h-2 rounded-full ${estaLleno ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${porcentajeOcupacion}%` }}
                  ></div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <Edit size={16} />
                    Editar
                  </button>
                  <button className="bg-white border border-gray-200 text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center justify-center">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}