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

type CollectionCenter = {
  collectioncenter_id: string | number;
  name: string;
  phone?: string | null;
  // Ahora normalizado a string desde la API
  email?: string | null;
  person_id?: {
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  district_id?: { district_name?: string | null } | null;
};

type TopMaterial = {
  material_name: string;
  total_amount: number;
  times_recycled: number;
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

interface CentersClientProps {
  initialCenters: unknown[];
  initialTopMaterials: unknown[];
}

export default function CentersClient({
  initialCenters,
  initialTopMaterials,
}: CentersClientProps) {
  const router = useRouter();
  const [centers] = useState<CollectionCenter[]>(
    initialCenters as CollectionCenter[]
  );
  const [topMaterials] = useState<TopMaterial[]>(
    initialTopMaterials as TopMaterial[]
  );
  const [loading] = useState(false);
  const [topLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [topError] = useState<string | null>(null);

  // filters
  const [fName, setFName] = useState("");
  const [fManager, setFManager] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fEmail, setFEmail] = useState("");

  // Si en el futuro se requiere refrescar datos desde API, se pueden reintroducir utilidades dedicadas.

  const filtered = useMemo(() => {
    const nameQ = fName.trim().toLowerCase();
    const managerQ = fManager.trim().toLowerCase();
    const phoneQ = fPhone.trim().toLowerCase();
    const emailQ = fEmail.trim().toLowerCase();
    
    return centers.filter((c) => {
      const inName = !nameQ || (c.name ?? "").toLowerCase().includes(nameQ);
      
      const managerFullName = [
        c.person_id?.first_name,
        c.person_id?.last_name,
      ]
        .filter(Boolean)
        .join(" ");
      const inManager =
        !managerQ || managerFullName.toLowerCase().includes(managerQ);
      
      const inPhone = !phoneQ || (c.phone ?? "").toLowerCase().includes(phoneQ);
      const emailValue = c.email ?? "";
      const inEmail = !emailQ || emailValue.toLowerCase().includes(emailQ);
      
      return inName && inManager && inPhone && inEmail;
    });
  }, [centers, fName, fManager, fPhone, fEmail]);

  return (
    <div className="min-h-screen px-4 md:px-6 lg:px-8 py-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">
          Centros de acopio - consultas
        </h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <Card className="xl:col-span-3 h-full">
          <CardHeader>
            <CardTitle>Listado de centros de acopio</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[600px]">
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <div className="mb-2 text-sm text-muted-foreground">
              Total de centros: {centers.length}
            </div>
            <div className="overflow-y-auto pr-2 flex-1 max-h-[540px] md:max-h-[560px]">
              <Table className="w-full">
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead className="text-center">Nombre</TableHead>
                    <TableHead className="text-center">
                      Gerente
                    </TableHead>
                    <TableHead className="text-center">Teléfono</TableHead>
                    <TableHead className="text-center">Correo</TableHead>
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
                    : filtered.map((c) => (
                        <TableRow key={c.collectioncenter_id}>
                          <TableCell className="text-center">
                            {c.name}
                          </TableCell>
                          <TableCell className="text-center">
                            {[c.person_id?.first_name, c.person_id?.last_name]
                              .filter(Boolean)
                              .join(" ") || "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {c.phone ?? "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {c.email ?? "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="default"
                              className="w-full"
                              onClick={() =>
                                router.push(
                                  `/admin/consultas/centers/${c.collectioncenter_id}`
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

        <div className="flex flex-col gap-6 min-w-[340px]">
         

          <FiltersPanel>
            <div className="flex flex-col gap-1">
              <label className="font-medium">Nombre</label>
              <div className="flex items-center gap-2">
                <input
                  className="border rounded px-2 py-1 flex-1"
                  placeholder="Ingresa el nombre"
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                />
                {fName && (
                  <FilterTag label="Nombre" onClear={() => setFName("")} />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-medium">Gerente</label>
              <div className="flex items-center gap-2">
                <input
                  className="border rounded px-2 py-1 flex-1"
                  placeholder="Ingresa el nombre"
                  value={fManager}
                  onChange={(e) => setFManager(e.target.value)}
                />
                {fManager && (
                  <FilterTag label="Gerente" onClear={() => setFManager("")} />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-medium">Correo</label>
              <div className="flex items-center gap-2">
                <input
                  className="border rounded px-2 py-1 flex-1"
                  placeholder="Ingresa el correo"
                  value={fEmail}
                  onChange={(e) => setFEmail(e.target.value)}
                />
                {fEmail && (
                  <FilterTag label="Correo" onClear={() => setFEmail("")} />
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setFName("");
                setFManager("");
                setFPhone("");
                setFEmail("");
              }}
              className="border w-full rounded px-2 py-1 bg-muted"
            >
              Limpiar filtros
            </button>
          </FiltersPanel>

           <Card>
            <CardHeader>
              <CardTitle>Top 5 de materiales más reciclados</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {topError && (
                <p className="text-sm text-red-600 mb-2">{topError}</p>
              )}
              <Table className="min-w-[280px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Puesto</TableHead>
                    <TableHead className="text-center">Material</TableHead>
                    <TableHead className="text-right">Peso/Cantidad</TableHead>
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
                    : topMaterials.map((m, idx) => {
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
                          <TableRow key={`${m.material_name}-${idx}`}>
                            <TableCell className="whitespace-nowrap flex items-center gap-2">
                              <span aria-hidden>{medal}</span>
                              <span>{rank}</span>
                            </TableCell>
                            <TableCell>{m.material_name}</TableCell>
                            <TableCell className="text-right">
                              {m.total_amount} kg
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
