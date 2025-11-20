"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";

export default function UserTransactionsPage() {
  const [search, setSearch] = useState("");
  const { user: authUser } = useAuth();

  type Tx = { id: string; product: string; amount: number; date: string; store: string };
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!authUser?.id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/persons/${authUser.id}/affiliatedbusinesstransactions/get`);
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? 'Error fetching transactions');

        const rows = Array.isArray(body) ? body : (body?.data ?? []);

        const mapped = (rows || []).map((r: unknown, idx: number) => {
          const row = (r && typeof r === 'object') ? (r as Record<string, unknown>) : {};
          // Prefer the aggregated/normalized fields returned by the RPC
          const txId = String(row['transaction_code'] ?? row['transaction_id'] ?? `T${idx}`);
            const product = String(row['product_names'] ?? row['product_name'] ?? row['product'] ?? '—');
            const amount = Number(row['total_price'] ?? row['total_points'] ?? row['total_product_amount'] ?? 0) || 0;
          const date = row['created_at'] ? new Date(String(row['created_at'])).toLocaleString('es-CR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
          const store = row['affiliated_business_id'] && typeof row['affiliated_business_id'] === 'object' ? String((row['affiliated_business_id'] as Record<string, unknown>)['affiliated_business_name'] ?? (row['affiliated_business_name'] ?? row['affiliated_business'] ?? '—')) : String(row['affiliated_business_name'] ?? row['affiliated_business'] ?? '—');
          return { id: txId, product, amount, date, store } as Tx;
        });

        if (mounted) setTransactions(mapped);
      } catch (err) {
        console.error('Error loading user affiliated transactions', err);
        if (mounted) setTransactions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [authUser?.id]);

  // prevent `loading` unused variable lint warning while keeping the state
  void loading;

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
