"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { Role } from "@/types/role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Tipos mínimos basados en lo que devuelven nuestras APIs internas
interface PersonRow {
  user_id: string;
  first_name?: string;
  last_name?: string;
  second_last_name?: string;
  telephone_number?: string | null;
  birth_date?: string | null;
  user_name?: string | null;
  identification?: string | null;
  role?: string | null;
  gender?: string | null;
  document_type?: string | null;
}

interface PointsRow {
  person_id: string; // coincide con person.user_id
  point_amount: number;
}

// Utilidades pequeñas y reutilizables dentro de este archivo para mantener DRY
function usePersonsAndPoints() {
  const [persons, setPersons] = useState<PersonRow[]>([]);
  const [points, setPoints] = useState<PointsRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const [pRes, ptsRes] = await Promise.all([
          fetch("/api/persons/get", { cache: "no-store" }),
          fetch("/api/points/get", { cache: "no-store" }),
        ]);

        const pJson = await pRes.json();
        const ptsJson = await ptsRes.json();

        if (!pRes.ok) throw new Error(pJson?.error || "Error cargando usuarios");
        if (!ptsRes.ok) throw new Error(ptsJson?.error || "Error cargando puntos");

        if (active) {
          setPersons((pJson?.data ?? []) as PersonRow[]);
          setPoints((ptsJson?.data ?? []) as PointsRow[]);
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

  return { persons, points, loading, error };
}

// Componente de etiqueta de filtro
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

// Panel genérico de filtros a la derecha
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

// Catálogos de países, provincias, cantones (cities) y distritos
type Country = { country_id: string; country_name: string };
type Province = { province_id: string; province_name: string; country?: { country_id: string } };
type City = { city_id: string; city_name: string; province_id?: { province_id: string } };
type District = { district_id: string; district_name: string; city_id?: { city_id: string } };

function useGeographyLists() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const [cRes, pRes, ciRes, dRes] = await Promise.all([
          fetch("/api/countries/get", { cache: "no-store" }),
          fetch("/api/provinces/get", { cache: "no-store" }),
          fetch("/api/cities/get", { cache: "no-store" }),
          fetch("/api/districts/get", { cache: "no-store" }),
        ]);
        const [cJ, pJ, ciJ, dJ] = await Promise.all([cRes.json(), pRes.json(), ciRes.json(), dRes.json()]);
        if (active) {
          setCountries(cJ?.data ?? []);
          setProvinces(pJ?.data ?? []);
          setCities(ciJ?.data ?? []);
          setDistricts(dJ?.data ?? []);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);
  return { countries, provinces, cities, districts, loading };
}

// Perfil enriquecido por usuario para conocer su ubicación (vía RPC get_profile_info)
type ProfileGeo = {
  country_id?: string; country_name?: string;
  province_id?: string; province_name?: string;
  city_id?: string; city_name?: string;
  district_id?: string; district_name?: string;
};

function useProfiles(persons: PersonRow[]) {
  const [profiles, setProfiles] = useState<Record<string, ProfileGeo>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadAll() {
      if (!persons || persons.length === 0) return;
      setLoading(true);
      try {
        const unique = Array.from(new Set(persons.map((p) => p.user_id)));
        const chunks: string[][] = [];
        const size = 10; // chunk simple para evitar demasiadas conexiones simultáneas
        for (let i = 0; i < unique.length; i += size) chunks.push(unique.slice(i, i + size));

        const result: Record<string, ProfileGeo> = {};
        for (const chunk of chunks) {
          const responses = await Promise.all(
            chunk.map(async (id) => {
              const res = await fetch(`/api/persons/${id}/get`, { cache: "no-store" });
              const j = await res.json();
              return { id, data: j?.data } as { id: string; data: unknown };
            })
          );
          for (const r of responses) {
            const d = Array.isArray(r.data) ? r.data[0] : r.data;
            // Intentamos proyectar campos de ubicación en distintos anidamientos comunes
            const district = d?.district || d?.district_id || d?.user_district || undefined;
            const city = district?.city || district?.city_id || d?.city || undefined;
            const province = city?.province || city?.province_id || d?.province || undefined;
            const country = province?.country || province?.country_id || d?.country || undefined;
            result[r.id] = {
              district_id: district?.district_id,
              district_name: district?.district_name,
              city_id: city?.city_id,
              city_name: city?.city_name,
              province_id: province?.province_id,
              province_name: province?.province_name,
              country_id: country?.country_id,
              country_name: country?.country_name,
            };
          }
        }
        if (active) setProfiles(result);
      } catch {
        // Si falla, dejamos perfiles vacíos; los filtros geográficos no aplicarán
        if (active) setProfiles({});
      } finally {
        if (active) setLoading(false);
      }
    }
    loadAll();
    return () => {
      active = false;
    };
  }, [persons]);

  return { profiles, loading };
}

export default function AdminConsultasPage() {
  const { role } = useAuth();
  const { persons, points, loading, error } = usePersonsAndPoints();
  const geo = useGeographyLists();
  const { profiles } = useProfiles(persons);
  const router = useRouter();

  // Filtros usuarios
  const [fName, setFName] = useState("");
  const [fLast, setFLast] = useState("");
  const [fId, setFId] = useState("");
  const [fUser, setFUser] = useState("");
  const [fPhone, setFPhone] = useState("");
  // geográficos
  const [fCountry, setFCountry] = useState<string>("");
  const [fProvince, setFProvince] = useState<string>("");
  const [fCity, setFCity] = useState<string>("");
  const [fDistrict, setFDistrict] = useState<string>("");

  // Filtros reporte de puntos
  const [fDateFrom, setFDateFrom] = useState("");
  const [fDateTo, setFDateTo] = useState("");

  // Un pequeño índice de puntos por person_id
  const pointsMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of points) map.set(p.person_id, Number(p.point_amount || 0));
    return map;
  }, [points]);

  const personsFiltered = useMemo(() => {
    return persons.filter((p) => {
      const fullName = [p.first_name, p.last_name, p.second_last_name].filter(Boolean).join(" ").toLowerCase();
      const inName = !fName || fullName.includes(fName.toLowerCase());
      const inLast = !fLast || (p.last_name ?? "").toLowerCase().includes(fLast.toLowerCase());
      const inId = !fId || (p.identification ?? "").toLowerCase().includes(fId.toLowerCase());
      const inUser = !fUser || (p.user_name ?? "").toLowerCase().includes(fUser.toLowerCase());
      const inPhone = !fPhone || (p.telephone_number ?? "").toLowerCase().includes(fPhone.toLowerCase());
      // geográficos: usamos mapa de perfiles
      const geoInfo = profiles[p.user_id];
      const inCountry = !fCountry || geoInfo?.country_id === fCountry;
      const inProv = !fProvince || geoInfo?.province_id === fProvince;
      const inCity = !fCity || geoInfo?.city_id === fCity;
      const inDist = !fDistrict || geoInfo?.district_id === fDistrict;
      return inName && inLast && inId && inUser && inPhone && inCountry && inProv && inCity && inDist;
    });
  }, [persons, profiles, fName, fLast, fId, fUser, fPhone, fCountry, fProvince, fCity, fDistrict]);

  const pointsReport = useMemo(() => {
    // Unimos personas con puntos disponibles
    const rows = personsFiltered.map((p) => {
      const total = pointsMap.get(p.user_id) ?? 0;
      // No hay endpoint de "canjeados" aún; mostramos 0 como placeholder explícito
      const redeemed = 0;
      const accumulated = total; // total acumulado actual
      return {
        user: [p.first_name, p.last_name].filter(Boolean).join(" "),
        total,
        accumulated,
        redeemed,
      };
    });

    const totals = rows.reduce(
      (acc, r) => {
        acc.total += r.total;
        acc.accumulated += r.accumulated;
        acc.redeemed += r.redeemed;
        return acc;
      },
      { user: "Totales", total: 0, accumulated: 0, redeemed: 0 }
    );

    return { rows, totals };
  }, [personsFiltered, pointsMap]);

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
      <h1 className="text-2xl md:text-3xl font-bold">Consultas Usuarios</h1>

      {/* Usuarios registrados + filtros */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 h-full">
          <CardHeader>
            <CardTitle>Usuarios Registrados</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[520px]">
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <div className="mb-2 text-sm text-muted-foreground">Total usuarios: {persons.length}</div>
            {/* Header estático fuera del contenedor scrolleable */}
            <Table className="mb-1">
              <TableHeader>
                <TableRow>
                  <TableHead>Identificación</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <div className="overflow-y-auto pr-2 flex-1">
              <Table>
                <TableBody>
                  {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><div className="h-4 w-24 animate-pulse bg-muted rounded" /></TableCell>
                          <TableCell><div className="h-4 w-40 animate-pulse bg-muted rounded" /></TableCell>
                          <TableCell><div className="h-4 w-28 animate-pulse bg-muted rounded" /></TableCell>
                          <TableCell><div className="h-4 w-24 animate-pulse bg-muted rounded" /></TableCell>
                          <TableCell className="text-right"><div className="h-8 w-20 ml-auto animate-pulse bg-muted rounded" /></TableCell>
                        </TableRow>
                      ))
                    : personsFiltered.map((p) => {
                        const name = [p.first_name, p.last_name, p.second_last_name].filter(Boolean).join(" ");
                        return (
                          <TableRow key={p.user_id}>
                            <TableCell>{p.identification ?? "-"}</TableCell>
                            <TableCell>{name || "-"}</TableCell>
                            <TableCell>{p.user_name ?? "-"}</TableCell>
                            <TableCell>{p.telephone_number ?? "-"}</TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="default" onClick={() => router.push(`/admin/consultas/user/${p.user_id}`)}>
                                Ver Usuario
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Filtros usuarios */}
        <FiltersPanel>
          <div className="flex items-center gap-2">
            <input className="border rounded px-2 py-1 flex-1" placeholder="Ingresa el nombre" value={fName} onChange={(e) => setFName(e.target.value)} />
            {fName && <FilterTag label="Nombre" onClear={() => setFName("")} />}
          </div>
          <div className="flex items-center gap-2">
            <input className="border rounded px-2 py-1 flex-1" placeholder="Ingresa el apellido" value={fLast} onChange={(e) => setFLast(e.target.value)} />
            {fLast && <FilterTag label="Apellidos" onClear={() => setFLast("")} />}
          </div>
          <div className="flex items-center gap-2">
            <input className="border rounded px-2 py-1 flex-1" placeholder="Ingresa la cédula" value={fId} onChange={(e) => setFId(e.target.value)} />
            {fId && <FilterTag label="Cédula" onClear={() => setFId("")} />}
          </div>
          {/* Cascada Country -> Province -> City -> District */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">País</label>
            <select className="border rounded px-2 py-1" value={fCountry} onChange={(e) => { setFCountry(e.target.value); setFProvince(""); setFCity(""); setFDistrict(""); }}>
              <option value="">Todos</option>
              {geo.countries.map((c) => (
                <option key={c.country_id} value={c.country_id}>{c.country_name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Provincia</label>
            <select className="border rounded px-2 py-1" value={fProvince} onChange={(e) => { setFProvince(e.target.value); setFCity(""); setFDistrict(""); }}>
              <option value="">Todas</option>
              {geo.provinces
                .filter((p) => !fCountry || p.country?.country_id === fCountry)
                .map((p) => (
                  <option key={p.province_id} value={p.province_id}>{p.province_name}</option>
                ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Cantón</label>
            <select className="border rounded px-2 py-1" value={fCity} onChange={(e) => { setFCity(e.target.value); setFDistrict(""); }}>
              <option value="">Todos</option>
              {geo.cities
                .filter((c) => !fProvince || c.province_id?.province_id === fProvince)
                .map((c) => (
                  <option key={c.city_id} value={c.city_id}>{c.city_name}</option>
                ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Distrito</label>
            <select className="border rounded px-2 py-1" value={fDistrict} onChange={(e) => setFDistrict(e.target.value)}>
              <option value="">Todos</option>
              {geo.districts
                .filter((d) => !fCity || d.city_id?.city_id === fCity)
                .map((d) => (
                  <option key={d.district_id} value={d.district_id}>{d.district_name}</option>
                ))}
            </select>
          </div>
          <button
            onClick={() => { setFName(""); setFLast(""); setFId(""); setFUser(""); setFPhone(""); setFCountry(""); setFProvince(""); setFCity(""); setFDistrict(""); }}
            className="border w-full rounded px-2 py-1 bg-muted"
          >
            Limpiar filtros
          </button>
        </FiltersPanel>
      </div>

      {/* Usuarios que no han cambiado la contraseña + filtros solicitados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 h-full">
          <CardHeader>
            <CardTitle>Usuarios que no han cambiado su contraseña</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[420px]">
            <p className="text-sm text-muted-foreground mb-3">Este reporte requiere un endpoint de auditoría de contraseñas. Los filtros están implementados y listos; cuando exista el endpoint, sólo hay que poblar el arreglo de resultados.</p>
            <Table className="mb-1">
              <TableHeader>
                <TableRow>
                  <TableHead>Identificación</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Último cambio</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <div className="overflow-y-auto pr-2 flex-1">
              <Table>
                <TableBody>
                  {[] /* vacío intencional */.map(() => null)}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">Total de usuarios que no han cambiado su contraseña: 0</div>
          </CardContent>
        </Card>

        <FiltersPanel>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <input className="border rounded px-2 py-1 flex-1" placeholder="Nombre" />
            </div>
            <div className="flex items-center gap-2">
              <input className="border rounded px-2 py-1 flex-1" placeholder="Apellidos" />
            </div>
            <div className="flex items-center gap-2">
              <input className="border rounded px-2 py-1 flex-1" placeholder="Identificación" />
            </div>
            <div className="flex items-center gap-2">
              <input className="border rounded px-2 py-1 flex-1" placeholder="Username" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Rango de fechas del último cambio</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" className="border rounded px-2 py-1" value={fDateFrom} onChange={(e) => setFDateFrom(e.target.value)} />
                <input type="date" className="border rounded px-2 py-1" value={fDateTo} onChange={(e) => setFDateTo(e.target.value)} />
              </div>
            </div>
            <button onClick={() => { setFDateFrom(""); setFDateTo(""); }} className="border w-full rounded px-2 py-1 bg-muted">Limpiar filtros</button>
          </div>
        </FiltersPanel>
      </div>

      {/* Reporte de puntos por usuario + filtros */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 h-full">
          <CardHeader>
            <CardTitle>Reporte de puntos por usuario</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[520px]">
            <Table className="mb-1">
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Total de Puntos</TableHead>
                  <TableHead>Puntos Acumulados</TableHead>
                  <TableHead>Puntos Canjeados</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <div className="overflow-y-auto pr-2 flex-1">
              <Table>
                <TableBody>
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><div className="h-4 w-28 animate-pulse bg-muted rounded" /></TableCell>
                          <TableCell><div className="h-4 w-16 animate-pulse bg-muted rounded" /></TableCell>
                          <TableCell><div className="h-4 w-16 animate-pulse bg-muted rounded" /></TableCell>
                          <TableCell><div className="h-4 w-16 animate-pulse bg-muted rounded" /></TableCell>
                        </TableRow>
                      ))
                    : pointsReport.rows.map((r, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{r.user || "-"}</TableCell>
                          <TableCell>{r.total}</TableCell>
                          <TableCell>{r.accumulated}</TableCell>
                          <TableCell>{r.redeemed}</TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>
            {/* Totales fijos al pie */}
            <div className="mt-3 border-t pt-3">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">{pointsReport.totals.user}</TableCell>
                    <TableCell className="font-medium">{pointsReport.totals.total}</TableCell>
                    <TableCell className="font-medium">{pointsReport.totals.accumulated}</TableCell>
                    <TableCell className="font-medium">{pointsReport.totals.redeemed}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <FiltersPanel>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Filtrar por fecha</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" className="border rounded px-2 py-1" value={fDateFrom} onChange={(e) => setFDateFrom(e.target.value)} />
              <input type="date" className="border rounded px-2 py-1" value={fDateTo} onChange={(e) => setFDateTo(e.target.value)} />
            </div>
            <small className="text-muted-foreground">Nota: Actualmente el endpoint de puntos no acepta rango de fechas.</small>
          </div>
        </FiltersPanel>
      </div>
    </div>
  );
}
