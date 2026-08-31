import { Users, CreditCard, Activity, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Panel Principal</h1>
        <p className="text-gray-500 mt-1">Resumen general del gimnasio al día de hoy.</p>
      </div>

      {/* Tarjetas de métricas (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta 1: Socios Activos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-blue-100 p-4 rounded-lg text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Socios Activos</p>
            <p className="text-2xl font-bold text-gray-800">142</p>
          </div>
        </div>

        {/* Tarjeta 2: Ingresos del Mes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-emerald-100 p-4 rounded-lg text-emerald-600">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Ingresos del Mes</p>
            <p className="text-2xl font-bold text-gray-800">$850.000</p>
          </div>
        </div>

        {/* Tarjeta 3: Cuotas Vencidas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-red-100 p-4 rounded-lg text-red-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Cuotas Vencidas</p>
            <p className="text-2xl font-bold text-gray-800">12</p>
          </div>
        </div>
      </div>

      {/* Sección inferior: Clases y Últimos Movimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clases de hoy (Control de espacios) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-emerald-500" />
            Ocupación de Clases Hoy
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="font-semibold text-gray-800">Crossfit</p>
                <p className="text-sm text-gray-500">18:00 hs - Prof. Carlos</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">15/20 lugares</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="font-semibold text-gray-800">Musculación</p>
                <p className="text-sm text-gray-500">19:00 hs - Prof. Ana</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-red-600 bg-red-100 px-3 py-1 rounded-full">20/20 Lleno</p>
              </div>
            </div>
          </div>
        </div>

        {/* Últimos pagos (Control financiero) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Últimos Pagos Registrados</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <div>
                  <p className="font-semibold text-gray-800">Martín Palermo</p>
                  <p className="text-sm text-gray-500">Pase Libre</p>
                </div>
              </div>
              <p className="font-semibold text-gray-800">$15.000</p>
            </div>
            <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <div>
                  <p className="font-semibold text-gray-800">Valentina Silva</p>
                  <p className="text-sm text-gray-500">Musculación</p>
                </div>
              </div>
              <p className="font-semibold text-gray-800">$12.000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}