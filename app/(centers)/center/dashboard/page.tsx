"use client";

import { useEffect, useState, useMemo } from 'react';
import ConversionTable from '@/components/ui/conversion';

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

type CollectionCenterMaterial = {
    collection_center_x_product_id: string;
    material_name: string;
    collection_center_name: string;
    unit_name: string;
    unit_exchange: number;
    full_name: string;
    updated_at: string;
};

type GlobalMaterial = {
    name?: string;
    material_name?: string;
    equivalent_points?: number;
};

export default function Page() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [materials, setMaterials] = useState<CollectionCenterMaterial[]>([]);
    const [globalMaterials, setGlobalMaterials] = useState<GlobalMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [collectionCenterId, setCollectionCenterId] = useState<string | null>(null);
    const [collectionCenterName, setCollectionCenterName] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (!collectionCenterId) return;
        (async () => {
            try {
                const res = await fetch(`/api/collectioncenters/${collectionCenterId}/get`);
                if (!res.ok) return;
                const data = await res.json();
                setCollectionCenterName(
                    data?.collectioncenter_name ?? data?.name ?? null
                );
            } catch {
                // silent
            }
        })();
    }, [collectionCenterId]);

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
                setCollectionCenterId(centerId);
                
                // Now fetch transactions for this collection center
                const transactionsResponse = await fetch(`/api/collectioncenters/${centerId}/collectioncentertransactions/get`);
                if (!transactionsResponse.ok) {
                    throw new Error('Error al obtener las transacciones');
                }
                const transactionsData = await transactionsResponse.json();
                
                console.log('Transactions data:', transactionsData);
                setTransactions(transactionsData || []);
                
                // Fetch materials for this collection center
                const materialsResponse = await fetch(`/api/collectioncenters/${centerId}/collectioncenterxmaterials/get`);
                if (!materialsResponse.ok) {
                    throw new Error('Error al obtener los materiales');
                }
                const materialsData = await materialsResponse.json();
                
                console.log('Materials data:', materialsData);
                setMaterials(materialsData || []);

                // Also fetch global material definitions to obtain canonical equivalent_points
                try {
                    const gmRes = await fetch('/api/materials/get');
                    if (gmRes.ok) {
                        const gmData = await gmRes.json();
                        setGlobalMaterials(gmData || []);
                    } else {
                        console.warn('Could not fetch global materials');
                    }
                } catch (e) {
                    console.warn('Error fetching global materials', e);
                }
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

    // Pagination logic
    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <main className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Panel del centro de acopio</h1>
                <h2 className="text-2xl font-bold mb-2">{collectionCenterName}</h2>
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
                                    {paginatedTransactions.map((transaction, index) => (
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

                    {/* Pagination Controls */}
                    {!loading && !error && transactions.length > 0 && (
                        <div className="flex items-center justify-between mt-4 px-4">
                            <div className="text-sm text-gray-600">
                                Mostrando {startIndex + 1} a {Math.min(endIndex, transactions.length)} de {transactions.length} transacciones
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`px-3 py-1 text-sm border rounded ${
                                            currentPage === page
                                                ? 'bg-green-500 text-white border-green-500'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Bottom Section*/}
                {
                    (() => {
                        type AggregatedMaterial = {
                            collection_center_x_product_id: string;
                            material_name: string;
                            amountKg: number;
                            points: number;
                        };

                        const MaterialEntry = ({
                            materials,
                            collectionCenterId,
                            globalMaterials,
                        }: {
                            materials: CollectionCenterMaterial[];
                            collectionCenterId: string | null;
                            globalMaterials: GlobalMaterial[];
                        }) => {
                            const [selectedMaterialId, setSelectedMaterialId] = useState('');
                            const [amountInput, setAmountInput] = useState('');
                            const [aggregated, setAggregated] = useState<AggregatedMaterial[]>([]);
                            const [userIdInput, setUserIdInput] = useState('');
                            const [sending, setSending] = useState(false);
                            const [errorMsg, setErrorMsg] = useState<string | null>(null);
                            const [successMsg, setSuccessMsg] = useState<string | null>(null);

                            const resetFeedback = () => {
                                setErrorMsg(null);
                                setSuccessMsg(null);
                            };

                            const addToList = () => {
                                resetFeedback();
                                if (!selectedMaterialId) {
                                    setErrorMsg('Seleccione un material.');
                                    return;
                                }
                                const amount = parseFloat(amountInput.replace(',', '.'));
                                if (isNaN(amount) || amount <= 0) {
                                    setErrorMsg('Ingrese una cantidad válida (> 0).');
                                    return;
                                }
                                const material = materials.find(
                                    m => m.collection_center_x_product_id === selectedMaterialId
                                );
                                if (!material) {
                                    setErrorMsg('Material no encontrado.');
                                    return;
                                }
                                // Prefer global equivalent_points from canonical material table
                                const global = (globalMaterials || []).find(
                                    (g: GlobalMaterial) => (g.name || g.material_name) === material.material_name
                                );
                                const rate = (global && (global.equivalent_points ?? global.equivalent_points === 0))
                                    ? Number(global.equivalent_points)
                                    : (material.unit_exchange ?? 0);
                                const points = amount * (rate || 0);
                                setAggregated(prev => [
                                    ...prev,
                                    {
                                        collection_center_x_product_id: material.collection_center_x_product_id,
                                        material_name: material.material_name,
                                        amountKg: amount,
                                        points,
                                    },
                                ]);
                                setAmountInput('');
                                setSelectedMaterialId('');
                            };

                            const removeItem = (idx: number) => {
                                resetFeedback();
                                setAggregated(prev => prev.filter((_, i) => i !== idx));
                            };

                            const sendEntry = async () => {
                                resetFeedback();
                                if (!collectionCenterId) {
                                    setErrorMsg('Centro de acopio no disponible.');
                                    return;
                                }
                                const cedula = userIdInput.trim();
                                if (!cedula) {
                                    setErrorMsg('Ingrese el número de cédula del usuario.');
                                    return;
                                }
                                if (aggregated.length === 0) {
                                    setErrorMsg('La lista está vacía.');
                                    return;
                                }

                                setSending(true);
                                try {
                                    // First, get user_id from identification
                                    const userIdRes = await fetch(`/api/persons/get/byDocumentID?identification=${encodeURIComponent(cedula)}`);
                                    if (!userIdRes.ok) {
                                        const errorData = await userIdRes.json().catch(() => ({}));
                                        throw new Error(errorData.error || `No se encontró usuario con cédula ${cedula}`);
                                    }
                                    
                                    const userIdData = await userIdRes.json();
                                    const personId = userIdData?.user_id;
                                    
                                    if (!personId) {
                                        console.error('User ID data:', userIdData);
                                        throw new Error('No se pudo obtener el ID del usuario');
                                    }

                                    console.log('Person ID obtenido:', personId);

                                    const items = aggregated.map(a => ({
                                        material_name: a.material_name,
                                        material_amount: Number(a.amountKg),
                                    }));

                                    const body = {
                                        person_identification: cedula,
                                        collection_center_id: collectionCenterId,
                                        items,
                                    };

                                    const res = await fetch('/api/collectioncentertransactions/post', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(body),
                                    });

                                    if (!res.ok) {
                                        const errorData = await res.json().catch(() => ({}));
                                        throw new Error(errorData.error || 'Error al crear la transacción.');
                                    }

                                    const transactionData = await res.json();
                                    console.log('Transacción creada:', transactionData);

                                    // Update points using the resolved user_id (increment, not replace)
                                    const totalPoints = Math.round(aggregated.reduce((sum, a) => sum + a.points, 0));
                                    console.log('Actualizando puntos:', { personId, totalPoints });
                                    
                                    const pointsRes = await fetch(`/api/points/${personId}/patch`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ points: totalPoints }),
                                    });
                                    
                                    if (!pointsRes.ok) {
                                        const pointsError = await pointsRes.json().catch(() => ({}));
                                        console.error('Error al actualizar puntos:', pointsError);
                                        throw new Error(pointsError.error || 'Error al actualizar puntos del usuario');
                                    }
                                    
                                    const pointsData = await pointsRes.json();
                                    console.log('Puntos actualizados exitosamente:', pointsData);

                                    setSuccessMsg(`Transacción registrada. ${pointsData.added_points} puntos agregados (Total: ${pointsData.new_total} pts)`);
                                    setAggregated([]);
                                    setUserIdInput('');
                                } catch (e) {
                                    setErrorMsg(e instanceof Error ? e.message : 'Error desconocido.');
                                    console.error('Error en sendEntry:', e);
                                } finally {
                                    setSending(false);
                                }
                            };

                            return (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* New Material Entry */}
                                    <section className="bg-white rounded-lg p-6 shadow-sm">
                                        <h2 className="text-lg font-semibold mb-4">Entrada de nuevo material</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-2">Tipo de material</label>
                                                <select
                                                    className="w-full p-3 bg-gray-100 rounded-lg border-0 text-sm"
                                                    value={selectedMaterialId}
                                                    onChange={e => setSelectedMaterialId(e.target.value)}
                                                >
                                                    <option value="">Seleccionar material</option>
                                                    {materials.map(material => {
                                                        const global = (globalMaterials || []).find(
                                                            (g: GlobalMaterial) => (g.name || g.material_name) === material.material_name
                                                        );
                                                        const rate = global?.equivalent_points ?? material.unit_exchange ?? 0;
                                                        return (
                                                            <option
                                                                key={material.collection_center_x_product_id}
                                                                value={material.collection_center_x_product_id}
                                                            >
                                                                {material.material_name} (x{rate} pts/kg)
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-2">Peso de carga (kg)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="Ingrese el Peso/Cantidad"
                                                    value={amountInput}
                                                    onChange={e => setAmountInput(e.target.value)}
                                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addToList}
                                                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium text-sm disabled:opacity-50"
                                                disabled={!materials.length}
                                            >
                                                Agregar a la lista
                                            </button>
                                            {errorMsg && (
                                                <p className="text-xs text-red-500">{errorMsg}</p>
                                            )}
                                            {successMsg && (
                                                <p className="text-xs text-green-600">{successMsg}</p>
                                            )}
                                        </div>
                                    </section>

                                    {/* Aggregated Materials */}
                                    <section className="bg-white rounded-lg p-6 shadow-sm lg:col-span-2">
                                        <h2 className="text-lg font-semibold mb-4">Lista de materiales agregados</h2>
                                        <div className="space-y-2">
                                            {aggregated.length === 0 && (
                                                <div className="text-sm text-gray-500">
                                                    No hay materiales agregados todavía.
                                                </div>
                                            )}
                                            {aggregated.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex justify-between items-center bg-green-50 p-3 rounded-lg text-sm"
                                                >
                                                    <span className="font-medium">{item.material_name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">
                                                            {item.amountKg.toFixed(2)}
                                                        </span>
                                                        <span className="text-gray-500">kg</span>
                                                        <span className="text-gray-400">=</span>
                                                        <span className="font-semibold">
                                                            {Math.round(item.points)}
                                                        </span>
                                                        <span className="text-gray-500">pts</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(idx)}
                                                            className="text-red-500 ml-2 hover:text-red-600"
                                                            aria-label="Eliminar"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {aggregated.length > 0 && (
                                                <div className="flex justify-end text-sm pt-2 border-t border-gray-200">
                                                    <span className="text-gray-600 mr-2">Total puntos:</span>
                                                    <span className="font-semibold">
                                                        {Math.round(
                                                            aggregated.reduce((s, a) => s + a.points, 0)
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="pt-4">
                                                <label className="block text-sm text-gray-600 mb-2">Usuario</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ingrese el ID del usuario (leer QR)"
                                                    value={userIdInput}
                                                    onChange={e => setUserIdInput(e.target.value)}
                                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={sendEntry}
                                                disabled={sending || aggregated.length === 0}
                                                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium text-sm disabled:opacity-50"
                                            >
                                                {sending ? 'Enviando...' : 'Enviar entrada'}
                                            </button>
                                        </div>
                                    </section>
                                </div>
                            );
                        };

                        return (
                            <MaterialEntry
                                materials={materials}
                                collectionCenterId={collectionCenterId}
                                globalMaterials={globalMaterials}
                            />
                        );
                    })()
                }

                    {/* Conversion Table (interactive) */}
                    <section className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Conversión del peso a puntos</h2>
                        <div>
                            <ConversionTable
                                conversionRates={useMemo(() => (
                                    materials.map(m => {
                                        const global = globalMaterials.find(g => (g.name || g.material_name) === m.material_name);
                                        const pointsVal = global?.equivalent_points ?? global?.equivalent_points === 0 ? global.equivalent_points : (m.unit_exchange ?? 0);
                                        return ({
                                            material: m.material_name,
                                            points: pointsVal,
                                            unit: m.unit_name ?? 'kg',
                                        });
                                    })
                                ), [materials, globalMaterials])}
                            />
                        </div>
                    </section>
            </main>
        </div>
    );
}