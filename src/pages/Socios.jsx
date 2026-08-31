import { Search, Plus, MoreVertical } from 'lucide-react';

// Datos ficticios para simular la base de datos
const sociosMock = [
  { id: 1, nombre: "Martín Palermo", dni: "32.456.789", plan: "Pase Libre", estado: "Al día", vencimiento: "15/09/2026" },
  { id: 2, nombre: "Sofía Martínez", dni: "39.123.456", plan: "Musculación", estado: "Vencido", vencimiento: "20/08/2026" },
  { id: 3, nombre: "Lucas Gómez", dni: "41.987.654", plan: "Crossfit", estado: "Por vencer", vencimiento: "31/08/2026" },
  { id: 4, nombre: "Valentina Silva", dni: "43.555.222", plan: "Pase Libre", estado: "Al día", vencimiento: "10/09/2026" },
  { id: 5, nombre: "Diego Torres", dni: "35.888.999", plan: "Boxeo", estado: "Vencido", vencimiento: "05/08/2026" }
];

export default function Socios() {
  return (
    <div className="space-y-6">
      {/* Encabezado y botón de acción */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Socios</h1>
          <p className="text-gray-500 mt-1">Administrá las cuotas y datos de tus alumnos.</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
          <Plus size={20} />
          Nuevo Socio
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar socio por nombre o DNI..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
          />
        </div>
      </div>

      {/* Tabla de alumnos */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
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
              {sociosMock.map((socio) => (
                <tr key={socio.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{socio.nombre}</td>
                  <td className="p-4 text-gray-600">{socio.dni}</td>
                  <td className="p-4 text-gray-600">{socio.plan}</td>
                  <td className="p-4 text-gray-600">{socio.vencimiento}</td>
                  <td className="p-4">
                    {/* Lógica de colores según el estado de la cuota */}
                    <span className={`inline-block whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold tracking-wide
    ${socio.estado === 'Al día' ? 'bg-emerald-100 text-emerald-700' : ''}
    ${socio.estado === 'Vencido' ? 'bg-red-100 text-red-700' : ''}
    ${socio.estado === 'Por vencer' ? 'bg-amber-100 text-amber-700' : ''}
  `}>
                      {socio.estado}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}