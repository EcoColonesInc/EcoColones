"use client";
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface TransactionRow {
  user_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  collection_center_name?: string | null;
  material_names?: string | null; // comma-separated names
  total_material_amount?: number | string | null;
  total_points?: number | null;
  transaction_code?: string | null;
  created_at?: string | null;
}

interface Props {
  centerId: string;
  initialTransactions: TransactionRow[];
}

function formatDate(d?: string | null) {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
}

export default function StatsClient({ centerId, initialTransactions }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>(initialTransactions || []);
  const [yearFilter, setYearFilter] = useState<string>('');
  const [monthFilter, setMonthFilter] = useState<string>('');
  // Material seleccionado (combobox). Vacío = todos.
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [materialMenuOpen, setMaterialMenuOpen] = useState(false);
  const materialBtnRef = useRef<HTMLButtonElement | null>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!materialBtnRef.current) return;
      const target = e.target as Node;
      if (!materialBtnRef.current.parentElement?.contains(target)) {
        setMaterialMenuOpen(false);
      }
    }
    if (materialMenuOpen) {
      window.addEventListener('mousedown', handler);
    }
    return () => window.removeEventListener('mousedown', handler);
  }, [materialMenuOpen]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/collectioncenters/${centerId}/collectioncentertransactions/get`, { cache: 'no-store' });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Error cargando transacciones');
      setTransactions(j || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }, [centerId]);
  
  useEffect(() => { if (initialTransactions.length === 0) { void refresh(); } }, [initialTransactions.length, refresh]);

  const years = useMemo(() => {
    const s = new Set<string>();
    for (const t of transactions) {
      if (t.created_at) s.add(new Date(t.created_at).getFullYear().toString());
    }
    return Array.from(s).sort();
  }, [transactions]);

  const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];

  const materialNames = useMemo(() => {
    const s = new Set<string>();
    for (const t of transactions) {
      const names = t.material_names;
      if (!names) continue;
      for (const p of names.split(',')) {
        const n = p.trim(); if (n) s.add(n);
      }
    }
    return Array.from(s).sort();
  }, [transactions]);

  function clearFilters() {
    setSelectedMaterial('');
    setYearFilter('');
    setMonthFilter('');
  }

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const d = t.created_at ? new Date(t.created_at) : null;
      if (yearFilter && (!d || d.getFullYear().toString() !== yearFilter)) return false;
      if (monthFilter && (!d || (d.getMonth()+1).toString().padStart(2,'0') !== monthFilter)) return false;
      if (selectedMaterial) {
        const names = t.material_names || '';
        const parts = names.split(',').map(x => x.trim()).filter(Boolean);
        if (!parts.includes(selectedMaterial)) return false;
      }
      return true;
    });
  }, [transactions, yearFilter, monthFilter, selectedMaterial]);

  const totalKg = useMemo(() => filtered.reduce((acc, t) => acc + (typeof t.total_material_amount === 'string' ? parseFloat(t.total_material_amount) : (t.total_material_amount || 0)), 0), [filtered]);

  const rankingMaterials = useMemo(() => {
    const rows = [...filtered].sort((a,b) => {
      const av = typeof a.total_material_amount === 'string' ? parseFloat(a.total_material_amount) : (a.total_material_amount || 0);
      const bv = typeof b.total_material_amount === 'string' ? parseFloat(b.total_material_amount) : (b.total_material_amount || 0);
      return bv - av; // desc
    });
    return rows.map((r,i) => ({ ...r, puesto: i+1 }));
  }, [filtered]);

  // Top 5 usuarios por material_amount total
  const topUsers = useMemo(() => {
    const map: Record<string, { user_name: string; totalKg: number; lastDate: string } > = {};
    for (const t of filtered) {
      const userName = t.user_name || t.first_name || 'Anon';
      const kg = typeof t.total_material_amount === 'string' ? parseFloat(t.total_material_amount) : (t.total_material_amount || 0);
      if (!map[userName]) map[userName] = { user_name: userName, totalKg: 0, lastDate: '' };
      map[userName].totalKg += kg;
      const d = t.created_at ? formatDate(t.created_at) : '';
      if (d && d > map[userName].lastDate) map[userName].lastDate = d;
    }
    const arr = Object.values(map).sort((a,b) => b.totalKg - a.totalKg).slice(0,5);
    return arr.map((u,i) => ({ puesto: i+1, ...u }));
  }, [filtered]);

  // Puntos por usuario (recalculados usando equivalent_points si disponible)
  const userPoints = useMemo(() => {
    const map: Record<string, { user_name: string; totalKg: number; points: number } > = {};
    for (const t of filtered) {
      const userName = t.user_name || t.first_name || 'Anon';
      const kg = typeof t.total_material_amount === 'string' ? parseFloat(t.total_material_amount) : (t.total_material_amount || 0);
      const pts = t.total_points || 0;
      if (!map[userName]) map[userName] = { user_name: userName, totalKg: 0, points: 0 };
      map[userName].totalKg += kg;
      map[userName].points += pts;
    }
    return Object.values(map).sort((a,b) => b.points - a.points);
  }, [filtered]);

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 py-6 space-y-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">Centro {transactions[0]?.collection_center_name || ''}</h1>
            <Button className="bg-gray-200 text-gray-800 hover:bg-gray-300" onClick={() => router.push(`/admin/consultas/centers/${centerId}`)}>Volver</Button>
          </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
        {/* Ranking materiales (principal izquierda) */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 flex items-center justify-between">
            <CardTitle className="text-lg">Cantidad de materiales reciclados</CardTitle>
            <div className="border rounded-md px-3 py-1.5 bg-green-50 font-medium text-sm">Total: {totalKg.toFixed(1)} kg</div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && <p className="text-sm">Cargando...</p>}
            {!loading && rankingMaterials.length === 0 && <p className="text-sm text-muted-foreground">Sin transacciones.</p>}
            {!loading && rankingMaterials.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left border-b bg-white/50">
                    <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 px-2">Puesto</th>
                      <th className="py-2 px-2">Material</th>
                      <th className="py-2 px-2">Peso/Cantidad</th>
                      <th className="py-2 px-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingMaterials.map(r => {
                      const kg = typeof r.total_material_amount === 'string' ? parseFloat(r.total_material_amount) : (r.total_material_amount || 0);
                      const firstMaterial = r.material_names ? r.material_names.split(',')[0].trim() : '-';
                      const key = r.transaction_code || (r.created_at ? `${r.created_at}_${r.user_name || r.first_name || ''}` : undefined);
                      return (
                        <tr key={key} className="border-b last:border-0 hover:bg-green-50/60">
                          <td className="py-2 px-2">{r.puesto}</td>
                          <td className="py-2 px-2">{firstMaterial}</td>
                          <td className="py-2 px-2">{kg.toFixed(1)} kg</td>
                          <td className="py-2 px-2">{formatDate(r.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Filtros (columna derecha) */}
        <Card className="shadow-sm lg:sticky top-6 h-fit">
          <CardHeader className="pb-2"><CardTitle className="text-lg">Filtros</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {/* Combobox Material */}
            <div className="space-y-1">
              <label className="text-xs font-medium">Material</label>
              <div className="relative">
                <button ref={materialBtnRef} type="button" onClick={() => setMaterialMenuOpen(o=>!o)} className="w-full border rounded px-3 py-2 text-left text-sm flex justify-between items-center">
                  <span>{selectedMaterial || 'Todos'}</span>
                  <span className="text-xs">▾</span>
                </button>
                {materialMenuOpen && (
                  <div className="absolute z-10 mt-1 w-full border rounded bg-white shadow-sm max-h-52 overflow-auto text-sm">
                    <button onClick={() => { setSelectedMaterial(''); setMaterialMenuOpen(false); }} className={`w-full text-left px-3 py-2 hover:bg-green-50 ${selectedMaterial === '' ? 'bg-green-100 font-medium' : ''}`}>Todos</button>
                    {materialNames.map(m => (
                      <button key={m} onClick={() => { setSelectedMaterial(m); setMaterialMenuOpen(false); }} className={`w-full text-left px-3 py-2 hover:bg-green-50 ${selectedMaterial === m ? 'bg-green-100 font-medium' : ''}`}>{m}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Año</label>
                <select className="border rounded px-2 py-2 w-full text-sm" value={yearFilter} onChange={e=>setYearFilter(e.target.value)}>
                  <option value="">Todos</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Mes</label>
                <select className="border rounded px-2 py-2 w-full text-sm" value={monthFilter} onChange={e=>setMonthFilter(e.target.value)}>
                  <option value="">Todos</option>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            {(selectedMaterial || yearFilter || monthFilter) && (
              <Button size="sm" variant="secondary" onClick={clearFilters}>Limpiar filtros</Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top 5 usuarios */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-lg">Top 5 de usuarios con mayor reciclaje</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="text-left border-b">
                  <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 px-2">Puesto</th>
                    <th className="py-2 px-2">Usuario</th>
                    <th className="py-2 px-2">Cantidad Total Reciclaje</th>
                    <th className="py-2 px-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers.map(u => {
                    const base = "border-b last:border-0 transition";
                    const bg = u.puesto === 1
                      ? "bg-yellow-50"
                      : u.puesto === 2
                        ? "bg-gray-50"
                        : u.puesto === 3
                          ? "bg-orange-50"
                          : "";
                    const medal = u.puesto === 1 ? "🥇" : u.puesto === 2 ? "🥈" : u.puesto === 3 ? "🥉" : "";
                    return (
                      <tr key={u.user_name} className={`${base} ${bg} hover:bg-green-50`}> 
                        <td className="py-2 px-2 flex items-center gap-1">{medal && <span title={`Medalla puesto ${u.puesto}`}>{medal}</span>}<span>{u.puesto}</span></td>
                        <td className="py-2 px-2 font-medium">{u.user_name}</td>
                        <td className="py-2 px-2">{u.totalKg.toFixed(1)} kg</td>
                        <td className="py-2 px-2">{u.lastDate}</td>
                      </tr>
                    );
                  })}
                </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Puntos obtenidos por usuario */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-lg">Listado de puntos obtenidos por usuario</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left border-b">
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 px-2">Usuario</th>
                  <th className="py-2 px-2">Peso (kg)</th>
                  <th className="py-2 px-2">Puntos obtenidos</th>
                </tr>
              </thead>
              <tbody>
                {userPoints.map(u => (
                  <tr key={u.user_name} className="border-b last:border-0">
                    <td className="py-2 px-2">{u.user_name}</td>
                    <td className="py-2 px-2">{u.totalKg.toFixed(1)} kg</td>
                    <td className="py-2 px-2">{u.points.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
