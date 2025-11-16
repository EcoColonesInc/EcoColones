"use client";

import { Search } from "lucide-react";
import { useState } from "react";

export default function UserTransactionsPage() {
  const [search, setSearch] = useState("");

  const transactions = [
    {
      id: "ASD123",
      product: "Big mac",
      amount: 1400,
      date: "29/10/2025 5:30pm",
      store: "McDonalds",
    },
    {
      id: "CMV731",
      product: "Cono Vainilla",
      amount: 800,
      date: "28/10/2025 14:23pm",
      store: "Pops",
    },
  ];

  const filtered = transactions.filter((t) =>
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white px-6 md:px-16 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Search Bar */}
        <div className="relative w-full mb-8">
          <input
            type="text"
            placeholder="Buscar compra por ID"
            className="w-full bg-[#F0FDEE] border border-gray-200 rounded-full px-5 py-3 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search
            size={20}
            className="absolute right-5 top-3.5 text-gray-600"
          />
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-4">Historial de Compras</h2>

        {/* Table */}
        <div className="bg-[#F7FCFA] border border-gray-200 rounded-xl p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="pb-3">ID Transacción</th>
                <th className="pb-3">Producto</th>
                <th className="pb-3">Monto (puntos)</th>
                <th className="pb-3">Día y Hora</th>
                <th className="pb-3">Comercio</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-5 text-center text-gray-500">
                    No se encontraron transacciones
                  </td>
                </tr>
              )}

              {filtered.map((t) => (
                <tr key={t.id} className="border-t border-gray-200">
                  <td className="py-3">{t.id}</td>
                  <td>{t.product}</td>
                  <td>{t.amount}</td>
                  <td>{t.date}</td>
                  <td>{t.store}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
