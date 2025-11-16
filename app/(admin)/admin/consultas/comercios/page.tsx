"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type BusinessType = { business_type_id: string | number; name: string };

type AffiliatedBusiness = {
  affiliated_business_id: string | number;
  affiliated_business_name: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  manager_id?: { first_name?: string | null; last_name?: string | null; second_last_name?: string | null } | null;
  business_type_id?: { name?: string | null } | null;
  district_id?: { district_name?: string | null } | null;
};

function FilterTag({ label, onClear }: { label: string; onClear?: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-muted px-2 py-1 text-xs">
      <span>{label}</span>
      {onClear && (
        <button onClick={onClear} className="text-foreground/60 hover:text-foreground" aria-label={`Quitar ${label}`}>
          ×
        </button>
      )}
    </div>
  );
}

function FiltersPanel({ title = "Filtrar por", children }: { title?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">{children}</CardContent>
    </Card>
  );
}

export default function AdminConsultasComerciosPage() {
  const router = useRouter();

  const [businesses, setBusinesses] = useState<AffiliatedBusiness[]>([]);
  const [types, setTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [fName, setFName] = useState("");
  const [fManager, setFManager] = useState("");
  const [fType, setFType] = useState<string>(""); // stores type name

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const [bRes, tRes] = await Promise.all([
          fetch("/api/affiliatedbusiness/get", { cache: "no-store" }),
          fetch("/api/businesstypes/get", { cache: "no-store" }),
        ]);
        const bJ = await bRes.json();
        const tJ = await tRes.json();
        if (!bRes.ok) throw new Error(bJ?.error || "Error cargando comercios");
        if (!tRes.ok) throw new Error(tJ?.error || "Error cargando tipos de comercio");
        if (!active) return;
        setBusinesses((bJ?.data ?? []) as AffiliatedBusiness[]);
        setTypes((tJ?.data ?? []) as BusinessType[]);
        setError(null);
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

  const filtered = useMemo(() => {
    const nameQ = fName.trim().toLowerCase();
    const managerQ = fManager.trim().toLowerCase();
    const typeQ = fType.trim().toLowerCase();
    return businesses.filter((b) => {
      const inName = !nameQ || (b.affiliated_business_name ?? "").toLowerCase().includes(nameQ);
      const managerFullName = [b.manager_id?.first_name, b.manager_id?.last_name, b.manager_id?.second_last_name]
        .filter(Boolean)
        .join(" ");
      const inManager = !managerQ || managerFullName.toLowerCase().includes(managerQ);
      const typeName = b.business_type_id?.name ?? "";
      const inType = !typeQ || typeName.toLowerCase() === typeQ;
      return inName && inManager && inType;
    });
  }, [businesses, fName, fManager, fType]);

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 py-6 space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold">Comercios afiliados - consultas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 h-full">
          <CardHeader>
            <CardTitle>Listado de comercios</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[520px]">
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <div className="mb-2 text-sm text-muted-foreground">Total de comercios: {businesses.length}</div>

            {/* Header */}
            <Table className="mb-1">
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Nombre de Gerente</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Tipo de comercio</TableHead>
                  <TableHead className="text-right">Selección</TableHead>
                </TableRow>
              </TableHeader>
            </Table>

            {/* Scrollbar aparece sólo si el contenido excede la altura máxima */}
            <div className="overflow-y-auto pr-2 flex-1 max-h-[420px] md:max-h-[460px]">
              <Table>
                <TableBody>
                  {loading
                    ? Array.from({ length: 7 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><div className="h-4 w-48 animate-pulse bg-muted rounded" /></TableCell>
                          <TableCell><div className="h-4 w-40 animate-pulse bg-muted rounded" /></TableCell>
                          <TableCell><div className="h-4 w-28 animate-pulse bg-muted rounded" /></TableCell>
                          <TableCell><div className="h-4 w-40 animate-pulse bg-muted rounded" /></TableCell>
                          <TableCell className="text-right"><div className="h-8 w-24 ml-auto animate-pulse bg-muted rounded" /></TableCell>
                        </TableRow>
                      ))
                    : filtered.map((b) => (
                        <TableRow key={b.affiliated_business_id}>
                          <TableCell>{b.affiliated_business_name}</TableCell>
                          <TableCell>{[b.manager_id?.first_name, b.manager_id?.last_name, b.manager_id?.second_last_name].filter(Boolean).join(" ") || "-"}</TableCell>
                          <TableCell>{b.phone ?? "-"}</TableCell>
                          <TableCell>{b.business_type_id?.name ?? "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => router.push(`/admin/consultas/comercios/${b.affiliated_business_id}`)}
                            >
                              Seleccionar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <FiltersPanel>
          {/* Nombre del comercio */}
          <div className="flex flex-col gap-1">
            <label className="font-medium">Nombre del comercio</label>
            <div className="flex items-center gap-2">
              <input
                className="border rounded px-2 py-1 flex-1"
                placeholder="Ingresa el nombre"
                value={fName}
                onChange={(e) => setFName(e.target.value)}
              />
              {fName && <FilterTag label="Nombre del comercio" onClear={() => setFName("")} />}
            </div>
          </div>

          {/* Nombre del gerente */}
          <div className="flex flex-col gap-1">
            <label className="font-medium">Nombre del gerente</label>
            <div className="flex items-center gap-2">
              <input
                className="border rounded px-2 py-1 flex-1"
                placeholder="Ingresa el nombre del gerente"
                value={fManager}
                onChange={(e) => setFManager(e.target.value)}
              />
              {fManager && <FilterTag label="Nombre del gerente" onClear={() => setFManager("")} />}
            </div>
          </div>

          {/* Tipo de comercio */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">Tipo de comercio</label>
            <select
              className="border rounded px-2 py-1"
              value={fType}
              onChange={(e) => setFType(e.target.value)}
            >
              <option value="">Todos</option>
              {types.map((t) => (
                <option key={String(t.business_type_id)} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setFName("");
              setFManager("");
              setFType("");
            }}
            className="border w-full rounded px-2 py-1 bg-muted"
          >
            Limpiar filtros
          </button>

          <div className="pt-2 text-sm text-muted-foreground">Total de comercios: {filtered.length}</div>
        </FiltersPanel>
      </div>
    </div>
  );
}
