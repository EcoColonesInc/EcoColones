"use client";

import { useEffect, useState } from 'react';

type Transaction = {
    user_name: string;
    first_name: string;
    last_name: string;
    collection_center_name: string;
    material_names: string;
    total_material_amount: number;
    total_points: number;
    transaction_code: string;
    created_at: string;
};

export default function Page() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                
                // First, get the user's collection center
                const centerResponse = await fetch('/api/collectioncenters/get/user');
                if (!centerResponse.ok) {
                    throw new Error('Error al obtener el centro de acopio');
                }
                const centerData = await centerResponse.json();
                
                if (!centerData?.collectioncenter_id) {
                    throw new Error('No se encontró el centro de acopio del usuario');
                }
                
                const centerId = centerData.collectioncenter_id;
                
                // Now fetch transactions for this collection center
                const transactionsResponse = await fetch(`/api/collectioncenters/${centerId}/collectioncentertransactions/get`);
                if (!transactionsResponse.ok) {
                    throw new Error('Error al obtener las transacciones');
                }
                const transactionsData = await transactionsResponse.json();
                
                console.log('Transactions data:', transactionsData);
                setTransactions(transactionsData || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido');
            } finally {
                setLoading(false);
            }
        }
        
        fetchData();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

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
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Cargando transacciones...</div>
                        ) : error ? (
                            <div className="text-center py-8 text-red-500">{error}</div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No hay transacciones disponibles</div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="text-gray-600 text-sm">
                                        <th className="text-center py-3 px-4 font-medium">Transacción</th>
                                        <th className="text-center py-3 px-4 font-medium">Usuario</th>
                                        <th className="text-center py-3 px-4 font-medium">Material</th>
                                        <th className="text-center py-3 px-4 font-medium">Cantidad (kg)</th>
                                        <th className="text-center py-3 px-4 font-medium">Puntos</th>
                                        <th className="text-center py-3 px-4 font-medium">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((transaction, index) => (
                                        <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                                            <td className="py-4 px-4 text-sm text-center">{transaction.transaction_code}</td>
                                            <td className="py-4 px-4 text-sm text-center">
                                                {transaction.user_name || `${transaction.first_name || ''} ${transaction.last_name || ''}`.trim() || 'N/A'}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-center">{transaction.material_names || 'N/A'}</td>
                                            <td className="py-4 px-4 text-sm text-center">
                                                {transaction.total_material_amount != null ? Number(transaction.total_material_amount).toFixed(2) : '0.00'} kg
                                            </td>
                                            <td className="py-4 px-4 text-sm text-center">
                                                {transaction.total_points != null ? Number(transaction.total_points) : 0} pts
                                            </td>
                                            <td className="py-4 px-4 text-sm text-center">{formatDate(transaction.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
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