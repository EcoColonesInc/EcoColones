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
}

export default function Page() {
    const router = useRouter();
    const [activeUserTab, setActiveUserTab] = useState<'usuario' | 'nombre'>('usuario');
    const [activeCedulaTab, setActiveCedulaTab] = useState<'cedula' | 'numero'>('cedula');
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>(['Plástico']);
    const [userScores, setUserScores] = useState<UserScore[]>([]);
    const [topRecyclers, setTopRecyclers] = useState<TopRecycler[]>([]);
    const [loading, setLoading] = useState(true);
    const [collectionCenterId, setCollectionCenterId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [userSearchInput, setUserSearchInput] = useState('');
    const [cedulaSearchInput, setCedulaSearchInput] = useState('');

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
                        setLoading(false);
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
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching collection center:', error);
                setError('Error al conectar con el servidor');
                setLoading(false);
            }
        };

        fetchCollectionCenter();
    }, [router]);

    useEffect(() => {
        if (!collectionCenterId) return;

        const fetchUserScores = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log('Fetching scores for center:', collectionCenterId);
                const response = await fetch(`/api/collectioncenters/${collectionCenterId}/scores`);
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
                setLoading(false);
            }
        };

        fetchUserScores();
    }, [collectionCenterId]);
    
    // Obtener el collection center ID del usuario autenticado
    useEffect(() => {
        async function fetchTopRecyclers() {
            try {
                setLoading(true);
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
                setLoading(false);
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
    
    const materials = [
        { name: 'Plástico', icon: '♻️' },
        { name: 'Papel', icon: '📄' },
        { name: 'Vidrio', icon: '🥛' },
        { name: 'Metales', icon: '⚙️' },
        { name: 'Textiles', icon: '🧵' },
        { name: 'Otros', icon: '📦' },
        { name: 'Tetra Pak', icon: '🌿' },
        { name: 'Cartón', icon: '📦' }
    ];
    
    const recycledMaterials = [
        { position: 1, material: 'Plástico', weight: '49 kg', date: '2024-07-29' },
        { position: 2, material: 'Papel', weight: '40 kg', date: '2024-07-31' },
        { position: 3, material: 'Vidrio', weight: '35 kg', date: '2024-07-26' },
        { position: 4, material: 'Metales', weight: '32 kg', date: '2024-07-27' },
        { position: 5, material: 'Cartón', weight: '29 kg', date: '2024-07-31' },
    ];
    
    const toggleMaterial = (material: string) => {
        setSelectedMaterials(prev => 
            prev.includes(material) 
                ? prev.filter(m => m !== material)
                : [...prev, material]
        );
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <main className="max-w-[1600px] mx-auto">
                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr_0.8fr] gap-6 mb-6">
                    {/* Top 5 Users Card */}
                    <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
                        <h2 className="text-xl font-bold mb-8 leading-tight">
                            Top 5 de<br />usuarios<br />con<br />mayor<br />reciclaje
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
                                {loading ? (
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
                        
                        {/* Tabs Row 1 */}
                        <div className="flex gap-3 mb-3">
                            <div className="px-6 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border-2 border-transparent">
                                Usuario
                            </div>
                            <input
                                type="text"
                                value={userSearchInput}
                                onChange={(e) => setUserSearchInput(e.target.value)}
                                placeholder="Nombre de usuario"
                                className="px-6 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200 focus:bg-green-100 focus:text-green-800 focus:border-green-200 focus:outline-none transition-all"
                            />
                        </div>
                        
                        {/* Tabs Row 2 */}
                        <div className="flex gap-3 mb-6">
                            <div className="px-6 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border-2 border-transparent">
                                Cédula
                            </div>
                            <input
                                type="text"
                                value={cedulaSearchInput}
                                onChange={(e) => setCedulaSearchInput(e.target.value)}
                                placeholder="Numero de cédula"
                                className="px-6 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200 focus:bg-green-100 focus:text-green-800 focus:border-green-200 focus:outline-none transition-all"
                            />
                        </div>
                        
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-sm">
                                    <th className="text-center py-2">Usuario</th>
                                    <th className="text-center py-2">Nombre</th>
                                    <th className="text-center py-2">Peso (kg)</th>
                                    <th className="text-center py-2">Puntos obtenidos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="py-3 text-sm text-center text-gray-500">
                                            Cargando...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={4} className="py-3 text-sm text-center text-red-500">
                                            {error}
                                        </td>
                                    </tr>
                                ) : userScores.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-3 text-sm text-center text-gray-500">
                                            No hay datos disponibles
                                        </td>
                                    </tr>
                                ) : (
                                    userScores.map((score, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="py-3 text-sm text-center">{score.usuario}</td>
                                            <td className="py-3 text-sm text-center">{score.nombre}</td>
                                            <td className="py-3 text-sm text-center">{score.peso_kg.toFixed(2)} kg</td>
                                            <td className="py-3 text-sm text-center">{score.puntos_obtenidos}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Material Filter Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        <h2 className="text-lg font-bold mb-3">Filtro de material</h2>
                        <p className="text-xs text-gray-600 mb-4">
                            Selecciona el material a buscar
                        </p>
                        <div className="space-y-2">
                            {materials.map((material) => (
                                <button
                                    key={material.name}
                                    onClick={() => toggleMaterial(material.name)}
                                    className={`w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${
                                        selectedMaterials.includes(material.name)
                                            ? 'border-green-500 bg-green-50 shadow-sm'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                                        selectedMaterials.includes(material.name)
                                            ? 'border-green-500 bg-green-500'
                                            : 'border-gray-300'
                                    }`}>
                                        {selectedMaterials.includes(material.name) && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </span>
                                    <span className="text-lg">{material.icon}</span>
                                    <span className="text-sm font-medium">{material.name}</span>
                                </button>
                            ))}
                        </div>
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
                                        {recycledMaterials.map((item) => (
                                            <tr key={item.position} className="border-b border-gray-100">
                                                <td className="py-3 px-4 text-sm text-center">{item.position}</td>
                                                <td className="py-3 px-4 text-sm font-medium text-center">{item.material}</td>
                                                <td className="py-3 px-4 text-sm text-center">{item.weight}</td>
                                                <td className="py-3 px-4 text-xs text-gray-500 text-center">{item.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Right Side - Total and Filters */}
                            <div className="w-64 flex flex-col gap-4">
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                    <p className="text-sm">
                                        Total reciclado: <span className="font-bold text-base">185 kg</span>
                                    </p>
                                </div>
                                
                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-gray-700">Filtrar por</p>
                                    <select className="w-full p-3 bg-gray-200 rounded-lg text-sm font-medium text-gray-700 border-none focus:ring-2 focus:ring-green-500 focus:outline-none">
                                        <option>Seleccionar año</option>
                                        <option>2024</option>
                                        <option>2023</option>
                                    </select>
                                    <select className="w-full p-3 bg-gray-200 rounded-lg text-sm font-medium text-gray-700 border-none focus:ring-2 focus:ring-green-500 focus:outline-none">
                                        <option>Seleccionar mes</option>
                                        <option>Enero</option>
                                        <option>Febrero</option>
                                        <option>Marzo</option>
                                        <option>Abril</option>
                                        <option>Mayo</option>
                                        <option>Junio</option>
                                        <option>Julio</option>
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