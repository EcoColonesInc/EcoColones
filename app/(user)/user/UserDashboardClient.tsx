"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import ConversionTable from "@/components/ui/conversion";
import Link from "next/link";
import { USER_ROUTES } from "@/config/routes";
import { useState } from "react";

// --- Local types to avoid `any` usage ---
type TransactionRow = {
  id: string;
  center: string;
  material: string;
  qty: string;
  date: string;
  status?: string;
};

type ConversionRate = {
  material: string;
  points: number | string;
  unit?: string;
};

type UserDashboardClientProps = {
  user: {
    name: string;
    gender: string;
    age: number;
    identification: string;
    points: number;
    claimedPoints: number;
    availablePoints: number;
    recycled: number;
    rate: string;
    avatar: string;
  };
  transactions: TransactionRow[];
  conversionRates: ConversionRate[];
};

export default function UserDashboardClient({ user, transactions, conversionRates }: UserDashboardClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Calculate pagination
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

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

              <p className="text-sm text-gray-600 mt-3">Puntos canjeados:</p>
              <p className="text-xl font-semibold text-red-600">{user.claimedPoints}</p>

              <p className="text-sm text-gray-600 mt-3">Puntos disponibles:</p>
              <p className="text-xl font-semibold text-green-600">{user.availablePoints}</p>

              <p className="text-sm text-gray-600 mt-3">Material reciclado:</p>
              <p className="text-xl font-semibold">{user.recycled}</p>

              <p className="text-sm text-gray-600 mt-3">Tipo de cambio:</p>
              <p className="text-xl font-semibold">{user.rate}</p>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <Link href={USER_ROUTES.REDEEM}>
              <Button className="bg-green-600 hover:bg-green-700 text-white font-medium rounded-md py-2">
                Canjear
              </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* --- Bottom Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">Transacciones recientes</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#E9F4EE] text-gray-700 font-medium">
                  <tr>
                    <th className="py-2 px-3 rounded-tl-md">ID Transacción</th>
                    <th className="py-2 px-3">Centro</th>
                    <th className="py-2 px-3">Material</th>
                    <th className="py-2 px-3">Cantidad</th>
                    <th className="py-2 px-3 rounded-tr-md">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.length > 0 ? (
                    currentTransactions.map((txn: TransactionRow) => (
                      <tr
                        key={txn.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2 px-3">{txn.id}</td>
                        <td className="py-2 px-3">{txn.center}</td>
                        <td className="py-2 px-3">{txn.material}</td>
                        <td className="py-2 px-3">{txn.qty}</td>
                        <td className="py-2 px-3">{txn.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 px-3 text-center text-gray-500">
                        No hay transacciones disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-6 flex items-center justify-center">  
          {/* Conversion Table  */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-3">
              Conversión del peso a puntos
            </h3>
            <ConversionTable conversionRates={conversionRates} />
          </div>
          </div>      
        </div>
      </div>
    </div>
  );
}
