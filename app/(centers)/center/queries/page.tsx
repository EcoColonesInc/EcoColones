"use client";

import { useState } from "react";

export default function Page() {
    const [activeUserTab, setActiveUserTab] = useState<'usuario' | 'nombre'>('usuario');
    const [activeCedulaTab, setActiveCedulaTab] = useState<'cedula' | 'numero'>('cedula');
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>(['Plástico']);
    const [userSearchInput, setUserSearchInput] = useState('');
    const [cedulaSearchInput, setCedulaSearchInput] = useState('');
    
    const topUsers = [
        { position: 1, icon: '🥇', user: 'Albert05', weight: '45.5 kg', date: '2024-07-29' },
        { position: 2, icon: '🥈', user: 'PedroR86', weight: '36.2 kg', date: '2024-07-29' },
        { position: 3, icon: '🥉', user: 'MariaMA5', weight: '25.0 kg', date: '2024-07-28' },
        { position: 4, icon: '🏀', user: 'FabR18', weight: '12.7 kg', date: '2024-07-27' },
        { position: 5, icon: '🏐', user: 'MartyJos15', weight: '12.2 kg', date: '2024-07-31' },
    ];
    
    const userPoints = [
        { user: 'PedroR15', name: 'Pedro Gutierrez', weight: '25.0 kg', points: 375 },
        { user: 'FerMar96', name: 'Fatima Molina', weight: '30 kg', points: 187.5 },
        { user: 'Marquitos18', name: 'Marcos Valverde', weight: '28 kg', points: 180 },
        { user: 'GonZillaMarc', name: 'Bill González', weight: '32 kg', points: 155 },
        { user: 'Albert06', name: 'Alberto Zamora', weight: '49 kg', points: 123 },
    ];
    
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
                                {topUsers.map((user) => (
                                    <tr key={user.position} className="border-t border-gray-100">
                                        <td className="py-4 text-center">
                                            <span className="text-2xl">{user.icon}</span>
                                        </td>
                                        <td className="py-4 text-sm font-medium text-center">{user.user}</td>
                                        <td className="py-4 text-sm text-center">{user.weight}</td>
                                        <td className="py-4 text-xs text-gray-500 text-center">{user.date}</td>
                                    </tr>
                                ))}
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
                        
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-xs text-gray-600 border-b border-gray-200">
                                        <th className="text-center pb-3 font-medium">Usuario</th>
                                        <th className="text-center pb-3 font-medium">Nombre</th>
                                        <th className="text-center pb-3 font-medium">Peso (kg)</th>
                                        <th className="text-center pb-3 font-medium">Puntos obtenidos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userPoints.map((user, index) => (
                                        <tr key={index} className="border-b border-gray-100">
                                            <td className="py-3 text-sm text-center">{user.user}</td>
                                            <td className="py-3 text-sm text-center">{user.name}</td>
                                            <td className="py-3 text-sm text-center">{user.weight}</td>
                                            <td className="py-3 text-sm font-medium text-center">{user.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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