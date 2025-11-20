"use client";

export default function Page() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <main className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Panel del centro de acopio</h1>
                <p className="text-gray-600 mb-8">
                    ¡Bienvenido de vuelta! Gestiona las opciones de tu centro de acopio desde aquí
                </p>

                {/* Recent Transactions */}
                <section className="bg-white rounded-lg p-6 mb-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Transacciones más recientes</h2>
                        <a href="#" className="text-blue-600 text-sm hover:underline">Ver todo</a>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-gray-600 text-sm">
                                    <th className="text-left py-3 px-4 font-medium">Transacción</th>
                                    <th className="text-left py-3 px-4 font-medium">Usuario</th>
                                    <th className="text-left py-3 px-4 font-medium">Material</th>
                                    <th className="text-left py-3 px-4 font-medium">Cantidad (kg)</th>
                                    <th className="text-left py-3 px-4 font-medium">Fecha</th>
                                    <th className="text-left py-3 px-4 font-medium">Estatus</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4 text-sm">TXN78649</td>
                                    <td className="py-4 px-4 text-sm">Marquito15</td>
                                    <td className="py-4 px-4 text-sm">Plástico</td>
                                    <td className="py-4 px-4 text-sm">15.5 kg</td>
                                    <td className="py-4 px-4 text-sm">2024-07-29</td>
                                    <td className="py-4 px-4">
                                        <span className="inline-block px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                            Completado
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4 text-sm">TXN78648</td>
                                    <td className="py-4 px-4 text-sm">Pedro985</td>
                                    <td className="py-4 px-4 text-sm">Metal</td>
                                    <td className="py-4 px-4 text-sm">8.2 kg</td>
                                    <td className="py-4 px-4 text-sm">2024-07-29</td>
                                    <td className="py-4 px-4">
                                        <span className="inline-block px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                            Completado
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4 text-sm">TXN78647</td>
                                    <td className="py-4 px-4 text-sm">Albert06</td>
                                    <td className="py-4 px-4 text-sm">Papel</td>
                                    <td className="py-4 px-4 text-sm">25.0 kg</td>
                                    <td className="py-4 px-4 text-sm">2024-07-28</td>
                                    <td className="py-4 px-4">
                                        <span className="inline-block px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                            Completado
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4 text-sm">TXN78646</td>
                                    <td className="py-4 px-4 text-sm">MariaA5</td>
                                    <td className="py-4 px-4 text-sm">Vidrio</td>
                                    <td className="py-4 px-4 text-sm">12.7 kg</td>
                                    <td className="py-4 px-4 text-sm">2024-07-27</td>
                                    <td className="py-4 px-4">
                                        <span className="inline-block px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                            Completado
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* New Material Entry */}
                    <section className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Entrada de nuevo material</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Tipo de material</label>
                                <select className="w-full p-3 bg-gray-100 rounded-lg border-0 text-sm">
                                    <option>Seleccionar material</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Peso de carga</label>
                                <input 
                                    type="text" 
                                    placeholder="Ingrese el Peso/Cantidad" 
                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Usuario-comprador</label>
                                <input 
                                    type="text" 
                                    placeholder="Ingrese el nombre del usuario" 
                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                                />
                            </div>
                            <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium text-sm">
                                Enviar entrada
                            </button>
                        </div>
                    </section>

                    {/* Aggregated Materials */}
                    <section className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Lista de materiales agregados</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg text-sm">
                                <span className="font-medium">Cartón</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">10</span>
                                    <span className="text-gray-500">kg</span>
                                    <span className="text-gray-400">=</span>
                                    <span className="font-semibold">150</span>
                                    <span className="text-gray-500">pts</span>
                                    <button className="text-red-500 ml-2 hover:text-red-600">🗑️</button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg text-sm">
                                <span className="font-medium">Papel</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">5</span>
                                    <span className="text-gray-500">kg</span>
                                    <span className="text-gray-400">=</span>
                                    <span className="font-semibold">50</span>
                                    <span className="text-gray-500">pts</span>
                                    <button className="text-red-500 ml-2 hover:text-red-600">🗑️</button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg text-sm">
                                <span className="font-medium">Vidrio</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">25</span>
                                    <span className="text-gray-500">kg</span>
                                    <span className="text-gray-400">=</span>
                                    <span className="font-semibold">375</span>
                                    <span className="text-gray-500">pts</span>
                                    <button className="text-red-500 ml-2 hover:text-red-600">🗑️</button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Conversion Table */}
                    <section className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Conversión del peso a puntos</h2>
                        <div className="space-y-1">
                            <div className="flex justify-between py-2 text-sm border-b border-gray-100">
                                <span className="text-gray-600 font-medium">Material</span>
                                <span className="text-gray-600 font-medium">Puntos por peso (C/t.C)</span>
                            </div>
                            <div className="flex justify-between py-2 text-sm border-b border-gray-100">
                                <span>Papel</span>
                                <span className="font-semibold">10</span>
                            </div>
                            <div className="flex justify-between py-2 text-sm border-b border-gray-100">
                                <span>Cartón</span>
                                <span className="font-semibold">15</span>
                            </div>
                            <div className="flex justify-between py-2 text-sm border-b border-gray-100">
                                <span>Vidrio</span>
                                <span className="font-semibold">15</span>
                            </div>
                            <div className="flex justify-between py-2 text-sm border-b border-gray-100">
                                <span>Tetra Pak</span>
                                <span className="font-semibold">15</span>
                            </div>
                            <div className="flex justify-between py-2 text-sm border-b border-gray-100">
                                <span>Textiles</span>
                                <span className="font-semibold">20</span>
                            </div>
                            <div className="flex justify-between py-2 text-sm">
                                <span>Metales</span>
                                <span className="font-semibold">25</span>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}