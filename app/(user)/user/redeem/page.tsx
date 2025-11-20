"use client";

import Image from "next/image";
import { Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { createClient } from "@/utils/supabase/client";

export default function UserRedeemPage() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]); // empty = no filter (show all)
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterBox, setShowFilterBox] = useState(false);

  const filterRef = useRef<HTMLDivElement | null>(null);

  // filter toggling handled via tempSelectedFilters when opening the panel
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowFilterBox(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load business types for the filter panel
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/businesstypes/get');
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? 'Error fetching business types');
        const rows = Array.isArray(body) ? body : (body?.data ?? []);
        const mapped = (rows || []).map((r: unknown) => {
          const row = (r && typeof r === 'object') ? (r as Record<string, unknown>) : {};
          const name = 'name' in row ? String(row['name'] ?? '') : '';
          const key = name ? name.toLowerCase().replace(/\s+/g, '') : '';
          return { key, label: name || 'Otro' };
        }).filter((t: { key: string; label: string }) => t.key);
        if (mounted) setAvailableTypes(mapped);
      } catch (err) {
        console.error('Error loading business types:', err);
        if (mounted) setAvailableTypes([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // API-loaded affiliated businesses (no static list)
  type StoreItem = { name: string; location: string; logo: string; type: string; typeLabel: string; id: string | number | null; raw?: unknown };
  const [apiStores, setApiStores] = useState<StoreItem[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [availableTypes, setAvailableTypes] = useState<Array<{ key: string; label: string }>>([]);
  const [tempSelectedFilters, setTempSelectedFilters] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setStoresLoading(true);
      try {
        const res = await fetch('/api/affiliatedbusiness/get');
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? 'Error fetching affiliated businesses');

        // API route returns data directly (array) — normalize if wrapper exists
        const rows = Array.isArray(body) ? body : (body?.data ?? []);

        const mapped = await Promise.all((rows || []).map(async (r: unknown) => {
          const row = (r && typeof r === 'object') ? (r as Record<string, unknown>) : {};
          const rawType = row['business_type_id'] && typeof row['business_type_id'] === 'object' ? String((row['business_type_id'] as Record<string, unknown>)['name'] ?? '') : String(row['business_type_id'] ?? '');
          const typeKey = rawType ? rawType.toString().toLowerCase().replace(/\s+/g, '') : 'other';
          const district = row['district_id'] && typeof row['district_id'] === 'object' ? String((row['district_id'] as Record<string, unknown>)['district_name'] ?? '') : String(row['district_id'] ?? '');
          
          // Get logo from Supabase storage using affiliated_business_id
          const businessId = row['affiliated_business_id'] as string | number | null;
          let logo = 'placeholder.png';
          if (businessId) {
            const extensions = ['png', 'jpg', 'jpeg', 'webp'];
            for (const ext of extensions) {
              const path = `${businessId}.${ext}`;
              const { data } = supabase.storage.from("business_logo").getPublicUrl(path);
              if (data?.publicUrl) {
                try {
                  const response = await fetch(data.publicUrl, { method: 'HEAD' });
                  if (response.ok) {
                    logo = data.publicUrl;
                    break;
                  }
                } catch {
                  // Continue to next extension
                }
              }
            }
          }
          
          return {
            name: String(row['affiliated_business_name'] ?? 'Negocio afiliado'),
            location: district ? `${district}` : '',
            logo,
            type: typeKey,
            typeLabel: rawType || 'Otro',
            id: row['affiliated_business_id'] as string | number | null,
            raw: row,
          } as StoreItem;
        }));

        if (mounted) setApiStores(mapped);
      } catch (err) {
        console.error('Error loading affiliated businesses:', err);
      } finally {
        if (mounted) setStoresLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Use only API stores (if none, show empty state)
  const filteredStores = apiStores.filter((store) => {
    const matchesType = selectedFilters.length === 0 ? true : selectedFilters.includes(store.type);
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Recent affiliated-business transactions (show only 2 here)
  const { user: authUser } = useAuth();
  type RecentTx = { id: string; product: string; amount: number; date: string; store: string };
  const [recentTransactions, setRecentTransactions] = useState<RecentTx[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!authUser?.id) return;
      setRecentLoading(true);
      try {
        const res = await fetch(`/api/persons/${authUser.id}/affiliatedbusinesstransactions/get`);
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? 'Error fetching user transactions');

        const rows = Array.isArray(body) ? body : (body?.data ?? []);
        
        const mapped = (rows || []).map((r: unknown, idx: number) => {
          const row = (r && typeof r === 'object') ? (r as Record<string, unknown>) : {};
          // Prefer the aggregated/normalized fields returned by the RPC
          const txId = String(row['transaction_code'] ?? row['transaction_id'] ?? `T${idx}`);
            const product = String(row['product_names'] ?? row['product_name'] ?? row['product'] ?? '—');
            const amount = Number(row['total_price'] ?? row['total_points'] ?? row['total_product_amount'] ?? 0) || 0;
          const date = row['created_at'] ? new Date(String(row['created_at'])).toLocaleString('es-CR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
          const store = row['affiliated_business_id'] && typeof row['affiliated_business_id'] === 'object' ? String((row['affiliated_business_id'] as Record<string, unknown>)['affiliated_business_name'] ?? (row['affiliated_business_name'] ?? row['affiliated_business'] ?? '—')) : String(row['affiliated_business_name'] ?? row['affiliated_business'] ?? '—');
          return { id: txId, product, amount, date, store } as RecentTx;
        });

        if (mounted) setRecentTransactions(mapped.slice(0, 2));
      } catch (err) {
        console.error('Error loading recent affiliated transactions:', err);
        if (mounted) setRecentTransactions([]);
      } finally {
        if (mounted) setRecentLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [authUser?.id]);

  return (
    <div className="min-h-screen bg-white px-6 md:px-16 py-10 relative">
      <div className="max-w-7xl mx-auto flex gap-10">

        {/* LEFT SIDE */}
        <div className="flex-1">

          {/* Search Bar */}
          <div className="relative mb-10 w-full" ref={filterRef}>
            <input
              type="text"
              placeholder="Buscar comercio"
              className="w-full bg-[#F7FCFA] border border-gray-300 rounded-full px-5 py-3 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Search className="absolute right-14 top-3.5 text-gray-500" size={22} />

            <SlidersHorizontal
              className="absolute right-5 top-3.5 text-gray-500 cursor-pointer"
              size={22}
              onClick={() => {
                // when opening the panel, initialize the temporary selection
                setShowFilterBox((v) => {
                  const opening = !v;
                  if (opening) setTempSelectedFilters(selectedFilters.slice());
                  return opening;
                });
              }}
            />

            {/* FILTER PANEL */}
            {showFilterBox && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-20">
                <h3 className="font-semibold mb-2 text-sm">Filtrar por tipo de comercio</h3>

                <div className="space-y-2 text-sm">
                  {availableTypes.length === 0 && (
                    <p className="text-sm text-gray-500">No hay categorías disponibles</p>
                  )}
                  {availableTypes.map((t) => (
                    <label className="flex gap-2" key={t.key}>
                      <input
                        type="checkbox"
                        checked={tempSelectedFilters.includes(t.key)}
                        onChange={() => {
                          setTempSelectedFilters((prev) =>
                            prev.includes(t.key) ? prev.filter((p) => p !== t.key) : [...prev, t.key]
                          );
                        }}
                      />
                      {t.label}
                    </label>
                  ))}
                </div>

                <Button
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    // apply temp filters to actual filters
                    setSelectedFilters(tempSelectedFilters.slice());
                    setShowFilterBox(false);
                  }}
                >
                  Aplicar filtros
                </Button>
              </div>
            )}
          </div>

          {/* Stores Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {storesLoading && (
              <p className="text-sm text-gray-500">Cargando comercios...</p>
            )}

            {!storesLoading && filteredStores.length === 0 && (
              <p className="text-sm text-gray-500">No hay comercios afiliados.</p>
            )}

            {filteredStores.map((store) => (
              <div
                key={store.id ?? store.name}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 flex flex-col items-center"
              >
                <div className="w-[110px] h-[110px] relative mb-3">
                  <Image
                    src={store.logo}
                    alt={store.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="font-semibold">{store.name}</p>
                <p className="text-sm text-gray-600 text-center">{store.location}</p>

                <Link href={`/user/redeem/comercial?id=${store.id}`}>
                  <Button className="mt-3 bg-green-600 hover:bg-green-700 rounded-md w-full">
                    Ver comercio
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* PURCHASE HISTORY */}
        <div className="w-[300px] bg-[#F7FCFA] border border-gray-200 rounded-xl p-6 h-fit">
          <h3 className="font-semibold text-lg mb-4">Historial de compras</h3>

          <div className="space-y-3 text-sm">
            {recentLoading && (
              <p className="text-sm text-gray-500">Cargando historial...</p>
            )}

            {!recentLoading && recentTransactions.length === 0 && (
              <p className="text-sm text-gray-500">No has realizado compras recientemente.</p>
            )}

            {!recentLoading && recentTransactions.length > 0 && (
              <div className="w-full">
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-1">
                  <div>Producto</div>
                  <div className="text-right">Precio</div>
                  <div className="text-right">Fecha</div>
                </div>
                {recentTransactions.map((t) => (
                  <div key={t.id} className="grid grid-cols-3 gap-2 items-center py-1">
                    <div className="text-sm text-gray-800 truncate">{t.product}</div>
                    <div className="text-sm text-right text-gray-700">{String(t.amount)} pts</div>
                    <div className="text-xs text-right text-gray-500">{t.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link href={`/user/redeem/transactions`}>
            <Button className="mt-6 bg-green-600 hover:bg-green-700 rounded-md w-full">
              Ver más...
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
