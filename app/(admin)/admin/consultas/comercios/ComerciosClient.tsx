"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
// Evitamos importar funciones server (usan next/headers). Usamos endpoints /api para refrescar.

type BusinessType = { business_type_id: string | number; name: string };

type AffiliatedBusiness = {
  affiliated_business_id: string | number;
  affiliated_business_name: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  manager_id?: {
    first_name?: string | null;
    last_name?: string | null;
    second_last_name?: string | null;
  } | null;
  business_type_id?: { name?: string | null } | null;
  district_id?: { district_name?: string | null } | null;
};

type TopProduct = {
  product_name: string;
  product_price?: number | null;
  affiliated_business_name?: string | null;
  total_quantity_sold?: number | null;
  times_purchased: number;
};

function FilterTag({
  label,
  onClear,
}: {
  label: string;
  onClear?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-muted px-2 py-1 text-xs">
      <span>{label}</span>
      {onClear && (
        <button
          onClick={onClear}
          className="text-foreground/60 hover:text-foreground"
          aria-label={`Quitar ${label}`}
        >
          ×
        </button>
      )}
    </div>
  );
}

function FiltersPanel({
  title = "Filtrar por",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">{children}</CardContent>
    </Card>
  );
}

interface ComerciosClientProps {
  initialBusinesses: unknown[];
  initialTypes: unknown[];
  initialTopProducts: unknown[];
}

export default function ComerciosClient({
  initialBusinesses,
  initialTypes,
  initialTopProducts,
}: ComerciosClientProps) {
  const router = useRouter();
  const [businesses] = useState<AffiliatedBusiness[]>(
    initialBusinesses as AffiliatedBusiness[]
  );
  const [types] = useState<BusinessType[]>(
    initialTypes as BusinessType[]
  );
  const [topProducts] = useState<TopProduct[]>(
    initialTopProducts as TopProduct[]
  );
  const [loading] = useState(false);
  const [topLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [topError] = useState<string | null>(null);

  // filters
  const [fName, setFName] = useState("");
  const [fManager, setFManager] = useState("");
  const [fType, setFType] = useState<string>("");

  // Funciones de refresco eliminadas según requerimiento; se pueden reintroducir si se necesitan nuevamente.

  // Si se requiere refrescar todo en conjunto, se puede reintroducir una función dedicada.

  const filtered = useMemo(() => {
    const nameQ = fName.trim().toLowerCase();
    const managerQ = fManager.trim().toLowerCase();
    const typeQ = fType.trim().toLowerCase();
    return businesses.filter((b) => {
      const inName =
        !nameQ ||
        (b.affiliated_business_name ?? "").toLowerCase().includes(nameQ);
      const managerFullName = [
        b.manager_id?.first_name,
        b.manager_id?.last_name,
        b.manager_id?.second_last_name,
      ]
        .filter(Boolean)
        .join(" ");
      const inManager =
        !managerQ || managerFullName.toLowerCase().includes(managerQ);
      const typeName = b.business_type_id?.name ?? "";
      const inType = !typeQ || typeName.toLowerCase() === typeQ;
      return inName && inManager && inType;
    });
  }, [businesses, fName, fManager, fType]);

  return (
    <div className="min-h-screen px-4 md:px-6 lg:px-8 py-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">
          Comercios afiliados - consultas
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 h-full">
          <CardHeader>
            <CardTitle>Listado de comercios</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[520px]">
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <div className="mb-2 text-sm text-muted-foreground">
              Total de comercios: {businesses.length}
            </div>
            <div className="overflow-y-auto overflow-x-hidden pr-2 flex-1 max-h-[460px] md:max-h-[480px]">
              <Table
                className="w-full"
                containerClassName="overflow-x-hidden px-2"
              >
                <colgroup>
                  <col className="w-[28%]" />
                  <col className="w-[28%]" />
                  <col className="w-[16%]" />
                  <col className="w-[18%]" />
                  <col className="w-[128px]" />
                </colgroup>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead className="text-center">Nombre</TableHead>
                    <TableHead className="text-center">
                      Nombre de Gerente
                    </TableHead>
                    <TableHead className="text-center">Teléfono</TableHead>
                    <TableHead className="text-center">
                      Tipo de comercio
                    </TableHead>
                    <TableHead className="text-center">Selección</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? Array.from({ length: 7 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-center">
                            <div className="h-4 w-48 mx-auto animate-pulse bg-muted rounded" />
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="h-4 w-40 mx-auto animate-pulse bg-muted rounded" />
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="h-4 w-28 mx-auto animate-pulse bg-muted rounded" />
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="h-4 w-40 mx-auto animate-pulse bg-muted rounded" />
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="h-8 w-24 mx-auto animate-pulse bg-muted rounded" />
                          </TableCell>
                        </TableRow>
                      ))
                    : filtered.map((b) => (
                        <TableRow key={b.affiliated_business_id}>
                          <TableCell className="text-center">
                            {b.affiliated_business_name}
                          </TableCell>
                          <TableCell className="text-center">
                            {[
                              b.manager_id?.first_name,
                              b.manager_id?.last_name,
                              b.manager_id?.second_last_name,
                            ]
                              .filter(Boolean)
                              .join(" ") || "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {b.phone ?? "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {b.business_type_id?.name ?? "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                router.push(
                                  `/admin/consultas/comercios/${b.affiliated_business_id}`
                                )
                              }
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

        <div className="flex flex-col gap-6">
          
          <FiltersPanel>
            <div className="flex flex-col gap-1">
              <label className="font-medium">Nombre del comercio</label>
              <div className="flex items-center gap-2">
                <input
                  className="border rounded px-2 py-1 flex-1"
                  placeholder="Ingresa el nombre"
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                />
                {fName && (
                  <FilterTag
                    label="Nombre del comercio"
                    onClear={() => setFName("")}
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-medium">Nombre del gerente</label>
              <div className="flex items-center gap-2">
                <input
                  className="border rounded px-2 py-1 flex-1"
                  placeholder="Ingresa el nombre del gerente"
                  value={fManager}
                  onChange={(e) => setFManager(e.target.value)}
                />
                {fManager && (
                  <FilterTag
                    label="Nombre del gerente"
                    onClear={() => setFManager("")}
                  />
                )}
              </div>
            </div>
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
          </FiltersPanel>
          <Card>
            <CardHeader>
              <CardTitle>Top 5 de productos más canjeados</CardTitle>
            </CardHeader>
            <CardContent>
              {topError && (
                <p className="text-sm text-red-600 mb-2">{topError}</p>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Puesto</TableHead>
                    <TableHead className="text-center">Nombre</TableHead>
                    <TableHead className="text-right">Veces Canjeado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="h-4 w-10 animate-pulse bg-muted rounded" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-40 animate-pulse bg-muted rounded" />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="h-4 w-16 ml-auto animate-pulse bg-muted rounded" />
                          </TableCell>
                        </TableRow>
                      ))
                    : topProducts.slice(0, 5).map((p, idx) => {
                        const rank = idx + 1;
                        const medal =
                          rank === 1
                            ? "🥇"
                            : rank === 2
                            ? "🥈"
                            : rank === 3
                            ? "🥉"
                            : "";
                        return (
                          <TableRow key={`${p.product_name}-${idx}`}>
                            <TableCell className="whitespace-nowrap flex items-center gap-2">
                              <span aria-hidden>{medal}</span>
                              <span>{rank}</span>
                            </TableCell>
                            <TableCell>{p.product_name}</TableCell>
                            <TableCell className="text-right">
                              {p.times_purchased}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
