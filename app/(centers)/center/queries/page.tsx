"use client";

import { useState } from "react";

export default function Page() {
    const [activeUserTab, setActiveUserTab] = useState<'usuario' | 'nombre'>('usuario');
    const [activeCedulaTab, setActiveCedulaTab] = useState<'cedula' | 'nombre'>('cedula');
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>(['Plástico']);

    const topUsers = [
        { position: 1, icon: '🥇', user: 'AdamSG', weight: '45.5 kg', date: '2024-07-29' },
        { position: 2, icon: '🥈', user: 'PedroRP1', weight: '42.2 kg', date: '2024-07-29' },
        { position: 3, icon: '🥉', user: 'MariaMA5', weight: '25.0 kg', date: '2024-07-28' },
        { position: 4, icon: '', user: 'FabR16', weight: '5.7 kg', date: '2024-07-27' },
        { position: 5, icon: '', user: 'MartyJos15', weight: '12.2 kg', date: '2024-07-31' },
    ];

    const userPoints = [
        { user: 'NoanH15', name: 'Pedro Gutierrez', weight: '35.0 kg', points: 375 },
        { user: 'FernandoSG', name: 'Hernan Medina', weight: '30 kg', weight_earned: '193.5' },
        { user: 'MarquesBR', name: 'Marcos Valverde', weight: '28 kg', points: 160 },
        { user: 'GonzaMene', name: 'Bill González', weight: '32 kg', weight_earned: '155' },
        { user: 'AlbertoR', name: 'Alberto Zamora', weight: '43 kg', points: 125 },
    ];

    const materials = [
        'Plástico', 'Papel', 'Vidrio', 'Metales', 'Textiles', 'Otros', 'Tetra Pak', 'Cartón'
    ];

    const recycledMaterials = [
        { position: 1, material: 'Plástico', weight: '48 kg', date: '2024-07-29' },
        { position: 2, material: 'Papel', weight: '44 kg', date: '2024-07-31' },
        { position: 3, material: 'Vidrio', weight: '35 kg', date: '2024-07-29' },
        { position: 4, material: 'Metales', weight: '32 kg', date: '2024-07-27' },
        { position: 5, material: 'Cartón', weight: '27 kg', date: '2024-07-31' },
    ];

    const toggleMaterial = (material: string) => {
        setSelectedMaterials(prev => 
            prev.includes(material) 
                ? prev.filter(m => m !== material)
                : [...prev, material]
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <main className="max-w-7xl mx-auto">
                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Top 5 Users Card */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6">
                            Top 5 de usuarios con mayor reciclaje
                        </h2>
                        
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-sm">
                                    <th className="text-left py-2">Puesto</th>
                                    <th className="text-left py-2">Usuario</th>
                                    <th className="text-left py-2">Cantidad de reciclado</th>
                                    <th className="text-left py-2">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topUsers.map((user) => (
                                    <tr key={user.position} className="border-b">
                                        <td className="py-3">
                                            <span className="text-2xl">{user.icon || user.position}</span>
                                        </td>
                                        <td className="py-3">{user.user}</td>
                                        <td className="py-3">{user.weight}</td>
                                        <td className="py-3 text-sm text-gray-600">{user.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* User Points Card */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">
                            Listado de puntos obtenidos por usuario
                        </h2>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setActiveUserTab('usuario')}
                                className={`px-4 py-2 rounded-full text-sm ${
                                    activeUserTab === 'usuario'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                Usuario
                            </button>
                            <button
                                onClick={() => setActiveUserTab('nombre')}
                                className={`px-4 py-2 rounded-full text-sm ${
                                    activeUserTab === 'nombre'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                Nombre de usuario
                            </button>
                        </div>

                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => setActiveCedulaTab('cedula')}
                                className={`px-4 py-2 rounded-full text-sm ${
                                    activeCedulaTab === 'cedula'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                Cédula
                            </button>
                            <button
                                onClick={() => setActiveCedulaTab('nombre')}
                                className={`px-4 py-2 rounded-full text-sm ${
                                    activeCedulaTab === 'nombre'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                Nombre de cédula
                            </button>
                        </div>

                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-sm">
                                    <th className="text-left py-2">Usuario</th>
                                    <th className="text-left py-2">Nombre</th>
                                    <th className="text-left py-2">Peso (kg)</th>
                                    <th className="text-left py-2">Puntos obtenidos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userPoints.map((user, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-3 text-sm">{user.user}</td>
                                        <td className="py-3 text-sm">{user.name}</td>
                                        <td className="py-3 text-sm">{user.weight}</td>
                                        <td className="py-3 text-sm">{user.points || user.weight_earned}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Material Filter Card */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Filtro de material</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Selecciona el material del cual quieres conocer información
                        </p>

                        <div className="space-y-2">
                            {materials.map((material) => (
                                <button
                                    key={material}
                                    onClick={() => toggleMaterial(material)}
                                    className={`w-full p-3 rounded-lg border-2 text-left flex items-center gap-2 transition-colors ${
                                        selectedMaterials.includes(material)
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <span className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                        selectedMaterials.includes(material)
                                            ? 'border-green-500 bg-green-500'
                                            : 'border-gray-300'
                                    }`}>
                                        {selectedMaterials.includes(material) && (
                                            <span className="text-white text-xs">✓</span>
                                        )}
                                    </span>
                                    {material === 'Plástico' && '♻️'} {material}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recycled Materials List */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">
                            Listado de la cantidad de materiales reciclados
                        </h2>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <p className="text-sm text-gray-600">Total reciclado: <span className="font-semibold">186 kg</span></p>
                        </div>

                        <table className="w-full mb-4">
                            <thead>
                                <tr className="border-b text-sm bg-green-50">
                                    <th className="text-left py-3 px-2">Puesto</th>
                                    <th className="text-left py-3 px-2">Material</th>
                                    <th className="text-left py-3 px-2">Peso/Cantidad reciclada</th>
                                    <th className="text-left py-3 px-2">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recycledMaterials.map((item) => (
                                    <tr key={item.position} className="border-b">
                                        <td className="py-3 px-2">{item.position}</td>
                                        <td className="py-3 px-2">{item.material}</td>
                                        <td className="py-3 px-2">{item.weight}</td>
                                        <td className="py-3 px-2 text-sm text-gray-600">{item.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="space-y-2">
                            <p className="text-sm font-semibold mb-2">Filtrar por:</p>
                            <select className="w-full p-3 bg-gray-200 rounded-lg text-sm">
                                <option>Seleccionar año</option>
                            </select>
                            <select className="w-full p-3 bg-gray-200 rounded-lg text-sm">
                                <option>Seleccionar mes</option>
                            </select>
                        </div>
                    </div>

                    {/* Empty space or additional content */}
                    <div></div>
                </div>
            </main>
        </div>
    );
}