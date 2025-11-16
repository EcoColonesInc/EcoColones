"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { Role } from "@/types/role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Tipado laxo de filas de bitácora; todas las propiedades opcionales porque el RPC puede variar.
interface BinnacleRow {
  updated_at?: string;
  created_at?: string;
  date?: string;
  user_full_name?: string;
  updated_by_full_name?: string;
  created_by_full_name?: string;
  user_name?: string;
  updated_by?: string;
  created_by?: string;
  change_type?: string;
  type?: string;
  object_name?: string;
  table_name?: string;
  full_name?: string;
  [key: string]: unknown;
}

interface UserRecyclingRow {
  person_id?: { first_name?: string; last_name?: string; second_last_name?: string };
  collection_center_id?: { name?: string };
  amount_recycle?: number | string;
  amount?: number | string;
  date?: string;
  created_at?: string;
  user_full_name?: string;
  user_name?: string;
  center_name?: string;
  [key: string]: unknown;
}

type TopEntry = { name: string; center?: string; kg: number; year: number; month: string };

export default function AdminAuditoriaPage() {
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [binnacles, setBinnacles] = useState<BinnacleRow[]>([]);
  const [recyclings, setRecyclings] = useState<UserRecyclingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Filtros bitácora
  const [filterUser, setFilterUser] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterTime, setFilterTime] = useState<string>(""); // formato HH:MM
  // Filtros top recicladores
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterCenter, setFilterCenter] = useState<string>("");

  // Cargar datos desde nuestras APIs internas
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const [binRes, recRes] = await Promise.all([
          fetch("/api/binnacles/get", { cache: "no-store" }),
          fetch("/api/userrecyclings/get", { cache: "no-store" }),
        ]);

        const binJson = await binRes.json();
        const recJson = await recRes.json();

        if (!binRes.ok) throw new Error(binJson?.error || "Error cargando bitácoras");
        if (!recRes.ok) throw new Error(recJson?.error || "Error cargando reciclajes");

        if (active) {
          setBinnacles(binJson?.data ?? []);
          setRecyclings(recJson?.data ?? []);
          setError(null);
        }
      } catch (e: unknown) {
        if (active) setError(e instanceof Error ? e.message : "Error inesperado");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const latestByTable = useMemo(() => {
    const byTable = new Map<string, BinnacleRow[]>();
    for (const row of binnacles) {
      const table = (row.object_name ?? row.table_name ?? "Desconocido") as string;
      if (!byTable.has(table)) byTable.set(table, []);
      byTable.get(table)!.push(row);
    }

    const result: Array<{
      table: string;
      createdBy?: string | null;
      createdAt?: string | null;
      updatedBy?: string | null;
      updatedAt?: string | null;
    }> = [];

    byTable.forEach((rows, table) => {
      const sorted = [...rows].sort((a, b) => {
        const da = new Date(a.updated_at ?? a.date ?? a.created_at ?? 0).getTime();
        const db = new Date(b.updated_at ?? b.date ?? b.created_at ?? 0).getTime();
        return db - da;
      });

      const last = sorted[0] ?? {};
      const created = sorted.find((r) => (r.change_type ?? r.type) === "INSERT") ?? sorted.at(-1) ?? {};
      const updated = sorted.find((r) => (r.change_type ?? r.type) === "UPDATE") ?? last;

      const nameFrom = (r: Record<string, unknown>): string | null => {
        const keys = [
          "person_user_name",
          "person_full_name",
          "user_full_name",
          "full_name",
          "created_by_display",
          "updated_by_display",
          "user_name",
        ] as const;
        for (const k of keys) {
          const v = r[k];
          if (typeof v === "string" && v.trim().length > 0) return v;
        }
        return null;
      };

      result.push({
        table,
        createdBy: nameFrom(created),
        createdAt: (created.updated_at ?? created.created_at ?? created.date ?? null) as string | null,
        updatedBy: nameFrom(updated),
        updatedAt: (updated.updated_at ?? updated.created_at ?? updated.date ?? null) as string | null,
      });
    });

    return result.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
  }, [binnacles]);

  const topMonthly = useMemo(() => {
    const key = (d: string) => {
      const dt = new Date(d);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      return `${y}-${m}`;
    };

    const map: Map<string, Map<string, TopEntry>> = new Map();
    for (const r of recyclings) {
      const date: string = r.date ?? r.created_at ?? new Date().toISOString();
      const k = key(date);
      const person = r.person_id?.first_name
        ? `${r.person_id.first_name} ${r.person_id.last_name ?? ""} ${r.person_id.second_last_name ?? ""}`.trim()
        : r.user_full_name ?? r.user_name ?? "Desconocido";
      const center = r.collection_center_id?.name ?? r.center_name ?? undefined;
      const kg = Number(r.amount_recycle ?? r.amount ?? 0);
      const dt = new Date(date);
      const year = dt.getFullYear();
      const month = dt.toLocaleString("es", { month: "long" });

      if (!map.has(k)) map.set(k, new Map<string, TopEntry>());
      const monthMap = map.get(k)!;
      const current: TopEntry = monthMap.get(person) ?? { name: person, center, kg: 0, year, month };
      current.kg += kg;
      monthMap.set(person, current);
    }

    const months = [...map.entries()].sort(([a], [b]) => (a < b ? 1 : -1));
    if (months.length === 0) return [] as TopEntry[];
    const latestMap = months[0][1];
    let top = [...latestMap.values()].sort((a, b) => b.kg - a.kg);
    top = top
      .filter((entry) => {
        const userMatch = !filterUser || entry.name.toLowerCase().includes(filterUser.toLowerCase());
        const monthMatch = !filterMonth || entry.month.toLowerCase() === filterMonth.toLowerCase();
        const yearMatch = !filterYear || String(entry.year) === filterYear;
        const centerMatch = !filterCenter || (entry.center ?? "").toLowerCase().includes(filterCenter.toLowerCase());
        return userMatch && monthMatch && yearMatch && centerMatch;
      })
      .slice(0, 10);
    return top;
  }, [recyclings, filterUser, filterMonth, filterYear, filterCenter]);

  const filteredBinnacles = useMemo(() => {
    return binnacles.filter((b: BinnacleRow) => {
      const userName: string = (
        b.person_user_name ||
        b.person_full_name ||
        b.user_full_name ||
        b.full_name ||
        b.created_by_display ||
        b.updated_by_display ||
        b.user_name ||
        ""
      ) as string;
      const type = (b.change_type ?? b.type ?? "").toString();
      const dateStr = b.updated_at ?? b.date ?? b.created_at;
      const d = dateStr ? new Date(dateStr) : null;
      const inUser = !filterUser || userName.toLowerCase().includes(filterUser.toLowerCase());
      const inType = !filterType || type.toLowerCase() === filterType.toLowerCase();
      const inDate = !filterDate || (d && d.toISOString().slice(0, 10) === filterDate);
      const inTime = !filterTime || (d && `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`.startsWith(filterTime));
      return inUser && inType && inDate && inTime;
    });
  }, [binnacles, filterUser, filterType, filterDate, filterTime]);

  const changeTypes = useMemo(() => {
    const set = new Set<string>();
    for (const b of binnacles) {
      const t = (b.change_type ?? b.type ?? "").toString().trim();
      if (t) set.add(t.toUpperCase());
    }
    const arr = Array.from(set);
    if (arr.length === 0) return ["INSERT", "UPDATE", "DELETE"];
    return arr;
  }, [binnacles]);

  if (role && role !== Role.ADMIN) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Acceso restringido</h2>
        <p>No cuentas con permisos para ver este panel.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 py-6 space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold">Auditoría</h1>

      {/* Últimas actualizaciones de registro */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas actualizaciones de registro</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
          <div className="max-h-64 overflow-y-auto pr-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario de Creación</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead>Usuario de Modificación</TableHead>
                  <TableHead>Última fecha de Modificación</TableHead>
                  <TableHead>Tabla modificada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className="h-4 w-24 animate-pulse bg-muted rounded" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-24 animate-pulse bg-muted rounded" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-24 animate-pulse bg-muted rounded" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-24 animate-pulse bg-muted rounded" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-24 animate-pulse bg-muted rounded" />
                        </TableCell>
                      </TableRow>
                    ))
                  : latestByTable.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.createdBy ?? "-"}</TableCell>
                        <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>{row.updatedBy ?? "-"}</TableCell>
                        <TableCell>{row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>{row.table ?? "-"}</TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl md:text-2xl font-bold">Bitácoras</h2>

      {/* Cambios realizados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cambios realizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto pr-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Tipo de cambio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="h-4 w-28 animate-pulse bg-muted rounded" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-24 animate-pulse bg-muted rounded" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-16 animate-pulse bg-muted rounded" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-20 animate-pulse bg-muted rounded" />
                          </TableCell>
                        </TableRow>
                      ))
                    : filteredBinnacles.map((b: BinnacleRow, i) => {
                        const dateStr = b?.updated_at ?? b?.date ?? b?.created_at;
                        const d = dateStr ? new Date(dateStr) : null;
                        const userName: string = (
                          b.person_user_name ||
                          b.person_full_name ||
                          b.user_full_name ||
                          b.full_name ||
                          b.created_by_display ||
                          b.updated_by_display ||
                          b.user_name ||
                          "-"
                        ) as string;
                        const changeType = (b?.change_type ?? b?.type ?? "").toString();
                        return (
                          <TableRow key={i}>
                            <TableCell>{userName}</TableCell>
                            <TableCell>{d ? d.toLocaleDateString() : "-"}</TableCell>
                            <TableCell>{d ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}</TableCell>
                            <TableCell>{changeType || "-"}</TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        {/* Filtros bitácora a la derecha */}
        <Card>
          <CardHeader>
            <CardTitle>Filtrar por</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex flex-col gap-2">
              <label className="font-medium">Usuario</label>
              <input
                type="text"
                placeholder="Ingresa el usuario"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Tipo de cambio</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="">Todos</option>
                {changeTypes.map((t) => (
                  <option key={t} value={t.toLowerCase()}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Fecha</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Hora (HH:MM)</label>
              <input
                type="text"
                placeholder="Ej: 09:30"
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value)}
                className="border rounded px-2 py-1"
                maxLength={5}
              />
            </div>
            <button
              onClick={() => {
                setFilterUser("");
                setFilterType("");
                setFilterDate("");
                setFilterTime("");
              }}
              className="border w-full rounded px-2 py-1 bg-muted"
            >
              Limpiar filtros
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Top recicladores mensuales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top recicladores mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto pr-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Mes</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>Centro de Acopio</TableHead>
                    <TableHead>Cantidad reciclada (Kg)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="h-4 w-28 animate-pulse bg-muted rounded" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-16 animate-pulse bg-muted rounded" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-12 animate-pulse bg-muted rounded" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-40 animate-pulse bg-muted rounded" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-16 animate-pulse bg-muted rounded" />
                          </TableCell>
                        </TableRow>
                      ))
                    : topMonthly.map((r: TopEntry, i) => (
                        <TableRow key={i}>
                          <TableCell>{r.name}</TableCell>
                          <TableCell>{r.month}</TableCell>
                          <TableCell>{r.year}</TableCell>
                          <TableCell>{r.center ?? "-"}</TableCell>
                          <TableCell>{`${r.kg} Kg`}</TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        {/* Filtros recicladores a la derecha */}
        <Card>
          <CardHeader>
            <CardTitle>Filtrar por</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex flex-col gap-2">
              <label className="font-medium">Usuario</label>
              <input
                type="text"
                placeholder="Ingresa el usuario"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Mes</label>
              <input
                type="text"
                placeholder="Ingresa el mes"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Año</label>
              <input
                type="text"
                placeholder="Ingresa el año"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Centro de Acopio</label>
              <input
                type="text"
                placeholder="Ingresa el centro de acopio"
                value={filterCenter}
                onChange={(e) => setFilterCenter(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
            <button
              onClick={() => {
                setFilterMonth("");
                setFilterYear("");
                setFilterCenter("");
                setFilterUser("");
              }}
              className="border w-full rounded px-2 py-1 bg-muted"
            >
              Limpiar filtros
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
