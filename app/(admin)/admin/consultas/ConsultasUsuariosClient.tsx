"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { Role } from "@/types/role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface PersonRow {
  user_id: string;
  first_name?: string; last_name?: string; second_last_name?: string;
  telephone_number?: string | null; birth_date?: string | null;
  user_name?: string | null; identification?: string | null; role?: string | null;
  gender?: string | null; document_type?: string | null;
}
interface PointsRow { person_id: string; point_amount: number | string | null }
interface Country { country_id: string; country_name: string }
interface Province { province_id: string; province_name: string; country?: { country_id: string } }
interface City { city_id: string; city_name: string; province_id?: { province_id: string } }
interface District { district_id: string; district_name: string; city_id?: { city_id: string } }

interface Props {
  initialPersons: unknown[];
  initialPoints: unknown[];
  initialCountries: unknown[];
  initialProvinces: unknown[];
  initialCities: unknown[];
  initialDistricts: unknown[];
}

type ProfileGeo = { country_id?: string; province_id?: string; city_id?: string; district_id?: string; country_name?: string; province_name?: string; city_name?: string; district_name?: string };

function FilterTag({ label, onClear }: { label: string; onClear?: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-muted px-2 py-1 text-xs">
      <span>{label}</span>{onClear && <button onClick={onClear} className="text-foreground/60 hover:text-foreground" aria-label={`Quitar ${label}`}>×</button>}
    </div>
  );
}
function FiltersPanel({ title = "Filtrar por", children }: { title?: string; children: React.ReactNode }) {
  return (
    <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">{children}</CardContent></Card>
  );
}

export default function ConsultasUsuariosClient({ initialPersons, initialPoints, initialCountries, initialProvinces, initialCities, initialDistricts }: Props) {
  const persons = (initialPersons as PersonRow[]);
  const points = (initialPoints as PointsRow[]);
  const countries = (initialCountries as Country[]);
  const provinces = (initialProvinces as Province[]);
  const cities = (initialCities as City[]);
  const districts = (initialDistricts as District[]);
  const { role } = useAuth();
  const router = useRouter();

  // Perfiles geográficos obtenidos vía RPC individual (mantiene /api para evitar importar server libs en cliente)
  const [profiles, setProfiles] = useState<Record<string, ProfileGeo>>({});
  useEffect(() => {
    let active = true;
    async function loadProfiles() {
      if (persons.length === 0) return;
      const ids = persons.map(p => p.user_id);
      const fetched: Record<string, ProfileGeo> = {};
      // Limita concurrencia simple
      for (const id of ids) {
        try {
          const r = await fetch(`/api/persons/${id}/get`, { cache: "no-store" });
          const j = await r.json();
          const d = Array.isArray(j.data) ? j.data[0] : j.data;
          const district = d?.district || d?.district_id || d?.user_district || undefined;
          const city = district?.city || district?.city_id || d?.city || undefined;
          const province = city?.province || city?.province_id || d?.province || undefined;
          const country = province?.country || province?.country_id || d?.country || undefined;
          fetched[id] = {
            district_id: district?.district_id,
            district_name: district?.district_name,
            city_id: city?.city_id,
            city_name: city?.city_name,
            province_id: province?.province_id,
            province_name: province?.province_name,
            country_id: country?.country_id,
            country_name: country?.country_name,
          };
        } catch { /* ignore */ }
      }
      if (active) setProfiles(fetched);
    }
    loadProfiles();
    return () => { active = false; };
  }, [persons]);

  // Filtros
  const [fName, setFName] = useState("");
  const [fLast, setFLast] = useState("");
  const [fId, setFId] = useState("");
  const [fUser, setFUser] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fCountry, setFCountry] = useState("");
  const [fProvince, setFProvince] = useState("");
  const [fCity, setFCity] = useState("");
  const [fDistrict, setFDistrict] = useState("");
  const [fDateFrom, setFDateFrom] = useState("");
  const [fDateTo, setFDateTo] = useState("");

  const pointsMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of points) m.set(p.person_id, Number(p.point_amount || 0));
    return m;
  }, [points]);

  const personsFiltered = useMemo(() => {
    return persons.filter(p => {
      const fullName = [p.first_name, p.last_name, p.second_last_name].filter(Boolean).join(" ").toLowerCase();
      const geoInfo = profiles[p.user_id];
      return (!fName || fullName.includes(fName.toLowerCase())) &&
        (!fLast || (p.last_name||'').toLowerCase().includes(fLast.toLowerCase())) &&
        (!fId || (p.identification||'').toLowerCase().includes(fId.toLowerCase())) &&
        (!fUser || (p.user_name||'').toLowerCase().includes(fUser.toLowerCase())) &&
        (!fPhone || (p.telephone_number||'').toLowerCase().includes(fPhone.toLowerCase())) &&
        (!fCountry || geoInfo?.country_id === fCountry) &&
        (!fProvince || geoInfo?.province_id === fProvince) &&
        (!fCity || geoInfo?.city_id === fCity) &&
        (!fDistrict || geoInfo?.district_id === fDistrict);
    });
  }, [persons, profiles, fName, fLast, fId, fUser, fPhone, fCountry, fProvince, fCity, fDistrict]);

  const pointsReport = useMemo(() => {
    const rows = personsFiltered.map(p => {
      const total = pointsMap.get(p.user_id) ?? 0;
      return { user: [p.first_name, p.last_name].filter(Boolean).join(" "), total, accumulated: total, redeemed: 0 };
    });
    const totals = rows.reduce((acc,r)=>{acc.total+=r.total;acc.accumulated+=r.accumulated;acc.redeemed+=r.redeemed;return acc;},{user:"Totales",total:0,accumulated:0,redeemed:0});
    return { rows, totals };
  }, [personsFiltered, pointsMap]);

  if (role && role !== Role.ADMIN) {
    return <div className="p-6"><h2 className="text-xl font-semibold">Acceso restringido</h2><p>No cuentas con permisos para ver este panel.</p></div>;
  }

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 py-6 space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold">Consultas Usuarios</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 h-full">
          <CardHeader><CardTitle>Usuarios Registrados</CardTitle></CardHeader>
          <CardContent className="flex flex-col h-[520px]">
            <div className="mb-2 text-sm text-muted-foreground">Total usuarios: {persons.length}</div>
            <Table className="mb-1"><TableHeader><TableRow><TableHead>Identificación</TableHead><TableHead>Nombre</TableHead><TableHead>Usuario</TableHead><TableHead>Teléfono</TableHead><TableHead className="text-right">Acción</TableHead></TableRow></TableHeader></Table>
            <div className="overflow-y-auto pr-2 flex-1">
              <Table><TableBody>{personsFiltered.map(p => {
                const name = [p.first_name,p.last_name,p.second_last_name].filter(Boolean).join(" ");
                return (<TableRow key={p.user_id}><TableCell>{p.identification||"-"}</TableCell><TableCell>{name||"-"}</TableCell><TableCell>{p.user_name||"-"}</TableCell><TableCell>{p.telephone_number||"-"}</TableCell><TableCell className="text-right"><Button size="sm" variant="default" onClick={()=>router.push(`/admin/consultas/user/${p.user_id}`)}>Ver Usuario</Button></TableCell></TableRow>);
              })}</TableBody></Table>
            </div>
          </CardContent>
        </Card>
        <FiltersPanel>
          <div className="flex items-center gap-2"><input className="border rounded px-2 py-1 flex-1" placeholder="Ingresa el nombre" value={fName} onChange={e=>setFName(e.target.value)} />{fName && <FilterTag label="Nombre" onClear={()=>setFName("")} />}</div>
          <div className="flex items-center gap-2"><input className="border rounded px-2 py-1 flex-1" placeholder="Ingresa el apellido" value={fLast} onChange={e=>setFLast(e.target.value)} />{fLast && <FilterTag label="Apellidos" onClear={()=>setFLast("")} />}</div>
          <div className="flex items-center gap-2"><input className="border rounded px-2 py-1 flex-1" placeholder="Ingresa la cédula" value={fId} onChange={e=>setFId(e.target.value)} />{fId && <FilterTag label="Cédula" onClear={()=>setFId("")} />}</div>
          <div className="flex flex-col gap-2"><label className="font-medium">País</label><select className="border rounded px-2 py-1" value={fCountry} onChange={e=>{setFCountry(e.target.value);setFProvince("");setFCity("");setFDistrict("");}}><option value="">Todos</option>{countries.map(c=><option key={c.country_id} value={c.country_id}>{c.country_name}</option>)}</select></div>
          <div className="flex flex-col gap-2"><label className="font-medium">Provincia</label><select className="border rounded px-2 py-1" value={fProvince} onChange={e=>{setFProvince(e.target.value);setFCity("");setFDistrict("");}}><option value="">Todas</option>{provinces.filter(p=>!fCountry||p.country?.country_id===fCountry).map(p=><option key={p.province_id} value={p.province_id}>{p.province_name}</option>)}</select></div>
          <div className="flex flex-col gap-2"><label className="font-medium">Cantón</label><select className="border rounded px-2 py-1" value={fCity} onChange={e=>{setFCity(e.target.value);setFDistrict("");}}><option value="">Todos</option>{cities.filter(c=>!fProvince||c.province_id?.province_id===fProvince).map(c=><option key={c.city_id} value={c.city_id}>{c.city_name}</option>)}</select></div>
          <div className="flex flex-col gap-2"><label className="font-medium">Distrito</label><select className="border rounded px-2 py-1" value={fDistrict} onChange={e=>setFDistrict(e.target.value)}><option value="">Todos</option>{districts.filter(d=>!fCity||d.city_id?.city_id===fCity).map(d=><option key={d.district_id} value={d.district_id}>{d.district_name}</option>)}</select></div>
          <button onClick={()=>{setFName("");setFLast("");setFId("");setFUser("");setFPhone("");setFCountry("");setFProvince("");setFCity("");setFDistrict("");}} className="border w-full rounded px-2 py-1 bg-muted">Limpiar filtros</button>
        </FiltersPanel>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 h-full"><CardHeader><CardTitle>Usuarios que no han cambiado su contraseña</CardTitle></CardHeader><CardContent className="flex flex-col h-[420px]"><p className="text-sm text-muted-foreground mb-3">Reporte placeholder; requiere endpoint futuro.</p><Table className="mb-1"><TableHeader><TableRow><TableHead>Identificación</TableHead><TableHead>Nombre</TableHead><TableHead>Teléfono</TableHead><TableHead>Último cambio</TableHead><TableHead>Acción</TableHead></TableRow></TableHeader></Table><div className="overflow-y-auto pr-2 flex-1" /><div className="mt-4 text-sm text-muted-foreground">Total: 0</div></CardContent></Card>
        <FiltersPanel title="Filtrar (contraseñas)"><div className="flex flex-col gap-3"><input className="border rounded px-2 py-1" placeholder="Nombre" /><input className="border rounded px-2 py-1" placeholder="Apellidos" /><input className="border rounded px-2 py-1" placeholder="Identificación" /><input className="border rounded px-2 py-1" placeholder="Username" /><div className="flex flex-col gap-2"><label className="font-medium">Rango fechas</label><div className="grid grid-cols-2 gap-2"><input type="date" className="border rounded px-2 py-1" value={fDateFrom} onChange={e=>setFDateFrom(e.target.value)} /><input type="date" className="border rounded px-2 py-1" value={fDateTo} onChange={e=>setFDateTo(e.target.value)} /></div></div><button onClick={()=>{setFDateFrom("");setFDateTo("");}} className="border w-full rounded px-2 py-1 bg-muted">Limpiar filtros</button></div></FiltersPanel>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 h-full"><CardHeader><CardTitle>Reporte de puntos por usuario</CardTitle></CardHeader><CardContent className="flex flex-col h-[520px]"><Table className="mb-1"><TableHeader><TableRow><TableHead>Usuario</TableHead><TableHead>Total</TableHead><TableHead>Acumulados</TableHead><TableHead>Canjeados</TableHead></TableRow></TableHeader></Table><div className="overflow-y-auto pr-2 flex-1"><Table><TableBody>{pointsReport.rows.map((r,i)=>(<TableRow key={i}><TableCell>{r.user||"-"}</TableCell><TableCell>{r.total}</TableCell><TableCell>{r.accumulated}</TableCell><TableCell>{r.redeemed}</TableCell></TableRow>))}</TableBody></Table></div><div className="mt-3 border-t pt-3"><Table><TableBody><TableRow><TableCell className="font-medium">{pointsReport.totals.user}</TableCell><TableCell className="font-medium">{pointsReport.totals.total}</TableCell><TableCell className="font-medium">{pointsReport.totals.accumulated}</TableCell><TableCell className="font-medium">{pointsReport.totals.redeemed}</TableCell></TableRow></TableBody></Table></div></CardContent></Card>
        <FiltersPanel title="Filtrar puntos"><div className="flex flex-col gap-2"><label className="font-medium">Fecha</label><div className="grid grid-cols-2 gap-2"><input type="date" className="border rounded px-2 py-1" value={fDateFrom} onChange={e=>setFDateFrom(e.target.value)} /><input type="date" className="border rounded px-2 py-1" value={fDateTo} onChange={e=>setFDateTo(e.target.value)} /></div><small className="text-muted-foreground">Endpoint no soporta rango todavía.</small></div></FiltersPanel>
      </div>
    </div>
  );
}