"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface TopRecycler {
    ranking: number;
    user_name: string;
    total_recycled: number;
    last_transaction_date: string;
}

interface UserScore {
    usuario: string;
    nombre: string;
    peso_kg: number;
    puntos_obtenidos: number;
    cedula: string;
}

interface RecycledMaterial {
    puesto: number;
    material: string;
    peso_kg: number;
    ultima_fecha: string;
}

export default function Page() {
    const router = useRouter();
    const [activeUserTab, setActiveUserTab] = useState<'usuario' | 'nombre'>('usuario');
    const [activeCedulaTab, setActiveCedulaTab] = useState<'cedula' | 'numero'>('cedula');
    const [userScores, setUserScores] = useState<UserScore[]>([]);
    const [topRecyclers, setTopRecyclers] = useState<TopRecycler[]>([]);
    const [recycledMaterials, setRecycledMaterials] = useState<RecycledMaterial[]>([]);
    const [loadingScores, setLoadingScores] = useState(true);
    const [loadingTopRecyclers, setLoadingTopRecyclers] = useState(true);
    const [loadingMaterials, setLoadingMaterials] = useState(true);
    const [collectionCenterId, setCollectionCenterId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [userSearchInput, setUserSearchInput] = useState('');
    const [cedulaSearchInput, setCedulaSearchInput] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [totalRecycled, setTotalRecycled] = useState<number>(0);

    useEffect(() => {
        // Fetch the collection center ID for the authenticated user
        const fetchCollectionCenter = async () => {
            try {
                const response = await fetch('/api/collectioncenters/user');
                if (response.ok) {
                    const data = await response.json();
                    console.log('Collection center data:', data);
                    if (!data || !data.collectioncenter_id) {
                        setError('No se encontró un centro de acopio asociado a este usuario');
                        setLoadingScores(false);
                        return;
                    }
                    setCollectionCenterId(data.collectioncenter_id);
                } else if (response.status === 401) {
                    console.error('Usuario no autenticado, redirigiendo al login...');
                    setError('Sesión expirada. Redirigiendo al login...');
                    setTimeout(() => router.push('/login'), 2000);
                } else {
                    const errorData = await response.json();
                    console.error('Error response:', errorData);
                    const errorMessage = errorData.error || 'Error desconocido';
                    setError(`Error: ${errorMessage}`);
                    setLoadingScores(false);
                }
            } catch (error) {
                console.error('Error fetching collection center:', error);
                setError('Error al conectar con el servidor');
                setLoadingScores(false);
            }
        };

        fetchCollectionCenter();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!collectionCenterId) return;

        const fetchUserScores = async () => {
            setLoadingScores(true);
            setError(null);
            try {
                console.log('Fetching scores for center:', collectionCenterId);
                
                // Construir URL con parámetros de búsqueda
                const params = new URLSearchParams();
                if (userSearchInput.trim()) {
                    params.append('user_name', userSearchInput.trim());
                }
                if (cedulaSearchInput.trim()) {
                    params.append('identification', cedulaSearchInput.trim());
                }
                
                const url = `/api/collectioncenters/${collectionCenterId}/scores${params.toString() ? `?${params.toString()}` : ''}`;
                console.log('Fetching URL:', url);
                
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    console.log('User scores data:', data);
                    setUserScores(data || []);
                } else {
                    const errorData = await response.json();
                    console.error('Error response:', errorData);
                    setError(`Error al obtener puntajes: ${errorData.error || 'Desconocido'}`);
                }
            } catch (error) {
                console.error('Error fetching user scores:', error);
                setError('Error al cargar los puntajes');
            } finally {
                setLoadingScores(false);
            }
        };

        // Debounce: esperar 500ms después de que el usuario deje de escribir
        const timeoutId = setTimeout(() => {
            fetchUserScores();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [collectionCenterId, userSearchInput, cedulaSearchInput]);
    
    // Obtener el collection center ID del usuario autenticado
    useEffect(() => {
        async function fetchTopRecyclers() {
            try {
                setLoadingTopRecyclers(true);
                // Primero obtener el collection center del usuario
                const centerResponse = await fetch('/api/collectioncenters/user/get');
                if (!centerResponse.ok) {
                    console.error('Error fetching user collection center');
                    return;
                }
                const centerData = await centerResponse.json();
                const collectionCenterId = centerData?.collectioncenter_id;
                
                if (!collectionCenterId) {
                    console.error('No collection center found for user');
                    return;
                }
                
                // Luego obtener el top 5 de recicladores
                const response = await fetch(`/api/collectioncenters/${collectionCenterId}/get?query=top_recyclers`);
                if (!response.ok) {
                    console.error('Error fetching top recyclers');
                    return;
                }
                const data = await response.json();
                setTopRecyclers(data || []);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoadingTopRecyclers(false);
            }
        }
        
        fetchTopRecyclers();
    }, []);
    
    const getPositionIcon = (position: number) => {
        switch(position) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            case 4: return '🏀';
            case 5: return '🏐';
            default: return '';
        }
    };
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };
    
    // Fetch recycled materials by collection center
    useEffect(() => {
        async function fetchRecycledMaterials() {
            if (!collectionCenterId) return;
            
            try {
                setLoadingMaterials(true);
                const params = new URLSearchParams();
                if (selectedMonth) params.append('month', selectedMonth);
                if (selectedYear) params.append('year', selectedYear);
                
                const queryString = params.toString();
                const url = `/api/collectioncenters/${collectionCenterId}/materials${queryString ? `?${queryString}` : ''}`;
                
                const response = await fetch(url);
                if (!response.ok) {
                    console.error('Error fetching recycled materials');
                    return;
                }
                
                const data = await response.json();
                setRecycledMaterials(data || []);
                
                // Fetch total weight separately    
                const totalResponse = await fetch(`/api/collectioncenters/${collectionCenterId}/total-weight${queryString ? `?${queryString}` : ''}`);
                if (totalResponse.ok) {
                    const totalData = await totalResponse.json();
                    setTotalRecycled(totalData.total || 0);
                } else {
                    setTotalRecycled(0);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoadingMaterials(false);
            }
        }
        
        fetchRecycledMaterials();
    }, [collectionCenterId, selectedMonth, selectedYear]);
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <main className="max-w-[1600px] mx-auto">
                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Top 5 Users Card */}
                    <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
                        <h2 className="text-xl font-bold mb-8 leading-tight">
                            Top 5 de usuarios con mayor reciclaje
                        </h2>
                        
                        <table className="w-full">
                            <thead>
                                <tr className="text-xs text-gray-600">
                                    <th className="text-center pb-3 font-medium">Puesto</th>
                                    <th className="text-center pb-3 font-medium">Usuario</th>
                                    <th className="text-center pb-3 font-medium">Cantidad total reciclaje</th>
                                    <th className="text-center pb-3 font-medium">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingTopRecyclers ? (
                                    <tr>
                                        <td colSpan={4} className="py-4 text-center text-sm text-gray-500">
                                            Cargando...
                                        </td>
                                    </tr>
                                ) : topRecyclers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-4 text-center text-sm text-gray-500">
                                            No hay datos disponibles
                                        </td>
                                    </tr>
                                ) : (
                                    topRecyclers.map((recycler) => (
                                        <tr key={recycler.ranking} className="border-t border-gray-100">
                                            <td className="py-4 text-center">
                                                <span className="text-2xl">{getPositionIcon(recycler.ranking)}</span>
                                            </td>
                                            <td className="py-4 text-sm font-medium text-center">{recycler.user_name}</td>
                                            <td className="py-4 text-sm text-center">{recycler.total_recycled} kg</td>
                                            <td className="py-4 text-xs text-gray-500 text-center">{formatDate(recycler.last_transaction_date)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* User Points Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        <h2 className="text-lg font-bold mb-4">
                            Listado de puntos obtenidos por usuario
                        </h2>
                        
                        {/* Search Inputs Row */}
                        <div className="flex gap-3 mb-6">
                            <div className="flex gap-2 items-center">
                                <div className="px-6 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border-2 border-transparent">
                                    Usuario
                                </div>
                                <input
                                    type="text"
                                    value={userSearchInput}
                                    onChange={(e) => setUserSearchInput(e.target.value)}
                                    placeholder="Buscar por usuario"
                                    className="px-6 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200 focus:bg-green-100 focus:text-green-800 focus:border-green-200 focus:outline-none transition-all"
                                />
                            </div>
                            
                            <div className="flex gap-2 items-center">
                                <div className="px-6 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border-2 border-transparent">
                                    Cédula
                                </div>
                                <input
                                    type="text"
                                    value={cedulaSearchInput}
                                    onChange={(e) => setCedulaSearchInput(e.target.value)}
                                    placeholder="Buscar por cédula"
                                    className="px-6 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200 focus:bg-green-100 focus:text-green-800 focus:border-green-200 focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                        
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-sm">
                                    <th className="text-center py-2">Usuario</th>
                                    <th className="text-center py-2">Nombre</th>
                                    <th className="text-center py-2">Cédula</th>
                                    <th className="text-center py-2">Peso (kg)</th>
                                    <th className="text-center py-2">Puntos obtenidos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingScores ? (
                                    <tr>
                                        <td colSpan={5} className="py-3 text-sm text-center text-gray-500">
                                            Cargando...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={5} className="py-3 text-sm text-center text-red-500">
                                            {error}
                                        </td>
                                    </tr>
                                ) : userScores.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-3 text-sm text-center text-gray-500">
                                            No hay datos disponibles
                                        </td>
                                    </tr>
                                ) : (
                                    userScores.map((score, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="py-3 text-sm text-center">{score.usuario}</td>
                                            <td className="py-3 text-sm text-center">{score.nombre}</td>
                                            <td className="py-3 text-sm text-center">{score.cedula}</td>
                                            <td className="py-3 text-sm text-center">{score.peso_kg.toFixed(2)} kg</td>
                                            <td className="py-3 text-sm text-center">{score.puntos_obtenidos}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Bottom Section */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Recycled Materials List */}
                    <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
                        <h2 className="text-lg font-bold mb-6">
                            Listado de la cantidad de materiales reciclados
                        </h2>
                        
                        <div className="flex gap-6">
                            {/* Table Section */}
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-green-50 text-xs text-gray-700">
                                            <th className="text-center py-3 px-4 font-semibold rounded-tl-lg">Puesto</th>
                                            <th className="text-center py-3 px-4 font-semibold">Material</th>
                                            <th className="text-center py-3 px-4 font-semibold">Peso/Cantidad reciclada</th>
                                            <th className="text-center py-3 px-4 font-semibold rounded-tr-lg">Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingMaterials ? (
                                            <tr>
                                                <td colSpan={4} className="py-8 text-center text-gray-500">
                                                    Cargando materiales...
                                                </td>
                                            </tr>
                                        ) : recycledMaterials.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-8 text-center text-gray-500">
                                                    No se encontraron materiales reciclados
                                                </td>
                                            </tr>
                                        ) : (
                                            recycledMaterials.map((item) => (
                                                <tr key={item.puesto} className="border-b border-gray-100">
                                                    <td className="py-3 px-4 text-sm text-center">{item.puesto}</td>
                                                    <td className="py-3 px-4 text-sm font-medium text-center">{item.material}</td>
                                                    <td className="py-3 px-4 text-sm text-center">{item.peso_kg} kg</td>
                                                    <td className="py-3 px-4 text-xs text-gray-500 text-center">{item.ultima_fecha}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Right Side - Total and Filters */}
                            <div className="w-64 flex flex-col gap-4">
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                    <p className="text-sm">
                                        Total reciclado: <span className="font-bold text-base">{totalRecycled.toFixed(2)} kg</span>
                                    </p>
                                </div>
                                
                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-gray-700">Filtrar por</p>
                                    <select 
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="w-full p-3 bg-gray-200 rounded-lg text-sm font-medium text-gray-700 border-none focus:ring-2 focus:ring-green-500 focus:outline-none"
                                    >
                                        <option value="">Seleccionar año</option>
                                        {Array.from({ length: new Date().getFullYear() - 2001 + 1 }, (_, i) => 2001 + i).reverse().map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                    <select 
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="w-full p-3 bg-gray-200 rounded-lg text-sm font-medium text-gray-700 border-none focus:ring-2 focus:ring-green-500 focus:outline-none"
                                    >
                                        <option value="">Seleccionar mes</option>
                                        <option value="1">Enero</option>
                                        <option value="2">Febrero</option>
                                        <option value="3">Marzo</option>
                                        <option value="4">Abril</option>
                                        <option value="5">Mayo</option>
                                        <option value="6">Junio</option>
                                        <option value="7">Julio</option>
                                        <option value="8">Agosto</option>
                                        <option value="9">Septiembre</option>
                                        <option value="10">Octubre</option>
                                        <option value="11">Noviembre</option>
                                        <option value="12">Diciembre</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}