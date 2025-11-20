"use client";

import { useEffect, useState } from 'react';

type Transaction = {
  person_id: { user_name: string; first_name: string; last_name: string };
  collection_center_id: { name: string };
  material_id: { name: string };
  total_points: number;
  material_amount: number;
  transaction_code: string;
  created_at: string;
};

export default function Page() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTransactions() {
            try {
                // Obtener el collection center y sus transacciones en una sola llamada
                const response = await fetch('/api/collectioncenters/me', {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });
                if (!response.ok) {
                    throw new Error('Error al obtener las transacciones');
                }
                const data = await response.json();
                
                setTransactions(data.transactions || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido');
            } finally {
                setLoading(false);
            }
        }

        fetchTransactions();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Main Content */}
            <main className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Panel del centro de acopio</h1>
                <p className="text-gray-600 mb-8">
                    ¡Bienvenido de vuelta! Gestiona las opciones de tu centro de acopio desde aquí
                </p>

                {/* Recent Transactions */}
                <section className="bg-white rounded-lg p-6 mb-8 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Transacciones más recientes</h2>
                        <a href="#" className="text-blue-600 text-sm">Ver todo</a>
                    </div>
                    
                    {loading ? (
                        <div className="text-center py-8">Cargando transacciones...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">{error}</div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No hay transacciones registradas</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full max-w-4xl mx-auto">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-center py-3">Código de Transacción</th>
                                        <th className="text-center py-3">Usuario</th>
                                        <th className="text-center py-3">Material</th>
                                        <th className="text-center py-3">Cantidad (kg)</th>
                                        <th className="text-center py-3">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.slice(0, 5).map((transaction, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="py-3 text-center">{transaction.transaction_code}</td>
                                            <td className="py-3 text-center">{transaction.person_id.user_name}</td>
                                            <td className="py-3 text-center">{transaction.material_id.name}</td>
                                            <td className="py-3 text-center">{transaction.material_amount} kg</td>
                                            <td className="py-3 text-center">{formatDate(transaction.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* New Material Entry */}
                    <section className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Entrada de nuevo material</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm mb-2">Tipo de material</label>
                                <select className="w-full p-3 bg-gray-200 rounded-lg">
                                    <option>Seleccionar material</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm mb-2">Peso de carga</label>
                                <input type="text" placeholder="Ingrese el Peso/Cantidad" className="w-full p-3 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm mb-2">Usuario requerido</label>
                                <input type="text" placeholder="Ingrese el nombre del usuario" className="w-full p-3 border rounded-lg" />
                            </div>
                            <button className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold">
                                Enviar entrada
                            </button>
                        </div>
                    </section>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Aggregated Materials */}
                        <section className="bg-white rounded-lg p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">Lista de materiales agregados</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-green-50 p-3 rounded">
                                    <span>Cartón</span>
                                    <div className="flex items-center gap-2">
                                        <span>10</span>
                                        <span className="text-gray-500">kg</span>
                                        <span>=</span>
                                        <span>150</span>
                                        <span className="text-gray-500">pts</span>
                                        <button className="text-red-500 ml-2">🗑️</button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-green-50 p-3 rounded">
                                    <span>Papel</span>
                                    <div className="flex items-center gap-2">
                                        <span>5</span>
                                        <span className="text-gray-500">kg</span>
                                        <span>=</span>
                                        <span>50</span>
                                        <span className="text-gray-500">pts</span>
                                        <button className="text-red-500 ml-2">🗑️</button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-green-50 p-3 rounded">
                                    <span>Vidrio</span>
                                    <div className="flex items-center gap-2">
                                        <span>25</span>
                                        <span className="text-gray-500">kg</span>
                                        <span>=</span>
                                        <span>375</span>
                                        <span className="text-gray-500">pts</span>
                                        <button className="text-red-500 ml-2">🗑️</button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Conversion Table */}
                        <section className="bg-white rounded-lg p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">Conversión del peso a puntos</h2>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Material</th>
                                        <th className="text-right py-2">Puntos por peso (C/t.C)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2">Papel</td>
                                        <td className="text-right py-2">10</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2">Cartón</td>
                                        <td className="text-right py-2">15</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2">Vidrio</td>
                                        <td className="text-right py-2">15</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2">Tetra Pak</td>
                                        <td className="text-right py-2">15</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2">Textiles</td>
                                        <td className="text-right py-2">20</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2">Metales</td>
                                        <td className="text-right py-2">25</td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}