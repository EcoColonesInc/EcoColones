"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function UserDashboard() {
    
  const user = {
    name: "Miguel Antonio de La Cruz Roja",
    gender: "Hombre",
    age: 25,
    identification: "6712381239123",
    points: 12300,
    recycled: "10kg",
    rate: "1 = 1",
    avatar: "/logo.png",
  };

  const transactions = [
    { id: "TXN73849", center: "La Gasel", material: "Plastic", qty: "15.5 kg", date: "2024-07-29", status: "Completed" },
    { id: "TXN73848", center: "La Gasel", material: "Metal", qty: "8.2 kg", date: "2024-07-29", status: "Completed" },
    { id: "TXN73847", center: "La Gasel", material: "Paper", qty: "25.0 kg", date: "2024-07-28", status: "Completed" },
    { id: "TXN73846", center: "La Carpio", material: "Glass", qty: "12.7 kg", date: "2024-07-27", status: "Completed" },
  ];

  const conversionRates = [
    { material: "Papel", points: 10 },
    { material: "Cartón", points: 15 },
    { material: "Vidrio", points: 15 },
    { material: "Tetra Pak", points: 15 },
    { material: "Aceite", points: 15 },
    { material: "Textiles", points: 20 },
    { material: "Aluminio", points: 25 },
  ];

  return (
    <div className="min-h-screen bg-[#F7FCFA] px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* --- Top Profile Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-6 flex items-center justify-center">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Image
                src={user.avatar}
                alt="Foto de usuario"
                width={160}
                height={160}
                className="rounded-full object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-700 mt-2">Género: {user.gender}</p>
                <p className="text-sm text-gray-700">Edad: {user.age} años</p>
                <p className="text-sm text-gray-700">
                  Identificación: {user.identification}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col justify-between">
            <div>
              <p className="text-sm text-gray-600">Puntos acumulados:</p>
              <p className="text-xl font-semibold">{user.points}</p>

              <p className="text-sm text-gray-600 mt-3">Material reciclado:</p>
              <p className="text-xl font-semibold">{user.recycled}</p>

              <p className="text-sm text-gray-600 mt-3">Tipo de cambio:</p>
              <p className="text-xl font-semibold">{user.rate}</p>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <Button className="bg-green-600 hover:bg-green-700 text-white font-medium rounded-md py-2">
                Canjear
              </Button>
              <Button className="bg-green-100 hover:bg-green-200 text-green-700 font-medium rounded-md py-2">
                Calculadora de puntos
              </Button>
            </div>
          </div>
        </div>

        {/* --- Bottom Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">Transacciones recientes</h3>
              <a href="#" className="text-sm text-green-600 hover:underline">
                Ver todas las transacciones
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#E9F4EE] text-gray-700 font-medium">
                  <tr>
                    <th className="py-2 px-3 rounded-tl-md">ID Transacción</th>
                    <th className="py-2 px-3">Centro</th>
                    <th className="py-2 px-3">Material</th>
                    <th className="py-2 px-3">Cantidad</th>
                    <th className="py-2 px-3">Fecha</th>
                    <th className="py-2 px-3 rounded-tr-md">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr
                      key={txn.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2 px-3">{txn.id}</td>
                      <td className="py-2 px-3">{txn.center}</td>
                      <td className="py-2 px-3">{txn.material}</td>
                      <td className="py-2 px-3">{txn.qty}</td>
                      <td className="py-2 px-3">{txn.date}</td>
                      <td className="py-2 px-3">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conversion Table */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-3">
              Conversión del peso a puntos
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead className="bg-[#E9F4EE] text-gray-700 font-medium">
                <tr>
                  <th className="py-2 px-3 rounded-tl-md">Material</th>
                  <th className="py-2 px-3 rounded-tr-md">Puntos por Peso (CRC)</th>
                </tr>
              </thead>
              <tbody>
                {conversionRates.map((row) => (
                  <tr key={row.material} className="border-b border-gray-100">
                    <td className="py-2 px-3">{row.material}</td>
                    <td className="py-2 px-3">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
