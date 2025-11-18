"use client";
import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { Role } from "@/types/role";
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
  district_id?: string | null;
}
interface PointsRow {
  person_id: string;
  point_amount: number | string | null;
}
interface Country {
  country_id: string;
  country_name: string;
}
interface Province {
  province_id: string;
  province_name: string;
  country?: { country_id: string };
}
interface City {
  city_id: string;
  city_name: string;
  province_id?: { province_id: string };
}
interface District {
  district_id: string;
  district_name: string;
  city_id?: { city_id: string };
}

interface Props {
  initialPersons: unknown[];
  initialPoints: unknown[];
  initialCountries: unknown[];
  initialProvinces: unknown[];
  initialCities: unknown[];
  initialDistricts: unknown[];
}

type ProfileGeo = {
  country_id?: string;
  province_id?: string;
  city_id?: string;
  district_id?: string;
  country_name?: string;
  province_name?: string;
  city_name?: string;
  district_name?: string;
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

interface SearchSelectOption {
  value: string;
  label: string;
}
interface SearchSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: SearchSelectOption[];
  placeholder?: string;
}

function SearchSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Todos",
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const selectedLabel =
    options.find((o) => o.value === value)?.label ||
    (value === "" ? placeholder : value);
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return options.filter((o) => !q || o.label.toLowerCase().includes(q));
  }, [options, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);
  const handleSelect = (val: string) => {
    onChange(val);
    close();
  };

  // Cierra al hacer click afuera
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (
        !containerRef.current ||
        containerRef.current.contains(e.target as Node)
      )
        return;
      close();
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, close]);

  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      <label className="font-medium text-sm">{label}</label>
      <div className="relative">
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls={`list-${label}`}
          placeholder={placeholder}
          className="border rounded px-2 py-1 w-full"
          value={open ? query : selectedLabel}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              close();
              return;
            }
            if (e.key === "Enter" && filtered.length === 1) {
              handleSelect(filtered[0].value);
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              listRef.current?.firstElementChild?.scrollIntoView({
                block: "nearest",
              });
            }
          }}
        />
        {open && (
          <ul
            id={`list-${label}`}
            role="listbox"
            ref={listRef}
            className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded border bg-popover shadow z-20 text-sm"
          >
            {placeholder && (
              <li
                role="option"
                aria-selected={value === ""}
                className="px-2 py-1 cursor-pointer hover:bg-muted"
                onClick={() => handleSelect("")}
              >
                {placeholder}
              </li>
            )}
            {filtered.map((o) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                className="px-2 py-1 cursor-pointer hover:bg-muted"
                onClick={() => handleSelect(o.value)}
              >
                {o.label}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-2 py-1 text-muted-foreground">
                Sin resultados
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function ConsultasUsuariosClient({
  initialPersons,
  initialPoints,
  initialCountries,
  initialProvinces,
  initialCities,
  initialDistricts,
}: Props) {
  const persons = initialPersons as PersonRow[];
  const points = initialPoints as PointsRow[];
  const countries = initialCountries as Country[];
  const provinces = initialProvinces as Province[];
  const cities = initialCities as City[];
  const districts = initialDistricts as District[];
  const { role } = useAuth();
  const router = useRouter();

  // Deriva perfiles geográficos localmente con district_id
  const profiles = useMemo(() => {
    const map: Record<string, ProfileGeo> = {};
    for (const p of persons) {
      const districtId = p.district_id || undefined;
      const dist = districtId
        ? districts.find((x) => x.district_id === districtId)
        : undefined;
      const cityId: string | undefined = dist?.city_id?.city_id;
      const cityObj = cityId
        ? cities.find((c) => c.city_id === cityId)
        : undefined;
      const provinceId: string | undefined = cityObj?.province_id?.province_id;
      const provinceObj = provinceId
        ? provinces.find((pr) => pr.province_id === provinceId)
        : undefined;
      const countryId: string | undefined = provinceObj?.country?.country_id;
      const countryObj = countryId
        ? countries.find((co) => co.country_id === countryId)
        : undefined;
      map[p.user_id] = {
        district_id: districtId,
        district_name: dist?.district_name,
        city_id: cityId,
        city_name: cityObj?.city_name,
        province_id: provinceId,
        province_name: provinceObj?.province_name,
        country_id: countryId,
        country_name: countryObj?.country_name,
      };
    }
    return map;
  }, [persons, districts, cities, provinces, countries]);
  // Filtros
  const [fName, setFName] = useState(""); // Nombre
  const [fLast, setFLast] = useState(""); // Primer Apellido
  const [fSecondLast, setFSecondLast] = useState(""); // Segundo Apellido
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
    return persons.filter((p) => {
      const geoInfo = profiles[p.user_id];
      return (
        (!fName ||
          (p.first_name || "").toLowerCase().includes(fName.toLowerCase())) &&
        (!fLast ||
          (p.last_name || "").toLowerCase().includes(fLast.toLowerCase())) &&
        (!fSecondLast ||
          (p.second_last_name || "")
            .toLowerCase()
            .includes(fSecondLast.toLowerCase())) &&
        (!fId ||
          (p.identification || "").toLowerCase().includes(fId.toLowerCase())) &&
        (!fUser ||
          (p.user_name || "").toLowerCase().includes(fUser.toLowerCase())) &&
        (!fPhone ||
          (p.telephone_number || "")
            .toLowerCase()
            .includes(fPhone.toLowerCase())) &&
        (!fCountry || geoInfo?.country_id === fCountry) &&
        (!fProvince || geoInfo?.province_id === fProvince) &&
        (!fCity || geoInfo?.city_id === fCity) &&
        (!fDistrict || geoInfo?.district_id === fDistrict)
      );
    });
  }, [
    persons,
    profiles,
    fName,
    fLast,
    fSecondLast,
    fId,
    fUser,
    fPhone,
    fCountry,
    fProvince,
    fCity,
    fDistrict,
  ]);

  const pointsReport = useMemo(() => {
    const rows = personsFiltered.map((p) => {
      const total = pointsMap.get(p.user_id) ?? 0;
      return {
        user: [p.first_name, p.last_name].filter(Boolean).join(" "),
        total,
        accumulated: total,
        redeemed: 0,
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 h-full">
          <CardHeader>
            <CardTitle>Usuarios Registrados</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[520px]">
            <div className="mb-2 text-sm text-muted-foreground">
              Total usuarios: {persons.length}
            </div>
            <div className="overflow-y-auto pr-2 flex-1">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>Identificación</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead>Provincia</TableHead>
                    <TableHead>Cantón</TableHead>
                    <TableHead>Distrito</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {personsFiltered.map((p) => {
                    const name = [p.first_name, p.last_name, p.second_last_name]
                      .filter(Boolean)
                      .join(" ");
                    const geo = profiles[p.user_id];
                    return (
                      <TableRow key={p.user_id}>
                        <TableCell>{p.identification || "-"}</TableCell>
                        <TableCell>{name || "-"}</TableCell>
                        <TableCell>{p.user_name || "-"}</TableCell>
                        <TableCell>{p.telephone_number || "-"}</TableCell>
                        <TableCell>{geo?.country_name || "…"}</TableCell>
                        <TableCell>{geo?.province_name || "…"}</TableCell>
                        <TableCell>{geo?.city_name || "…"}</TableCell>
                        <TableCell>{geo?.district_name || "…"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() =>
                              router.push(`/admin/consultas/user/${p.user_id}`)
                            }
                          >
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
        <FiltersPanel>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Nombre</label>
            <input
              className="border rounded px-2 py-1"
              placeholder="Ingresa el nombre"
              value={fName}
              onChange={(e) => setFName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Primer Apellido</label>
            <input
              className="border rounded px-2 py-1"
              placeholder="Ingresa el primer apellido"
              value={fLast}
              onChange={(e) => setFLast(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Segundo Apellido</label>
            <input
              className="border rounded px-2 py-1"
              placeholder="Ingresa el segundo apellido"
              value={fSecondLast}
              onChange={(e) => setFSecondLast(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              className="border rounded px-2 py-1 flex-1"
              placeholder="Ingresa la cédula"
              value={fId}
              onChange={(e) => setFId(e.target.value)}
            />
            {fId && <FilterTag label="Cédula" onClear={() => setFId("")} />}
          </div>
          <SearchSelect
            label="País"
            value={fCountry}
            onChange={(val) => {
              setFCountry(val);
              setFProvince("");
              setFCity("");
              setFDistrict("");
            }}
            options={countries.map((c) => ({
              value: c.country_id,
              label: c.country_name,
            }))}
            placeholder="Todos"
          />
          <SearchSelect
            label="Provincia"
            value={fProvince}
            onChange={(val) => {
              setFProvince(val);
              setFCity("");
              setFDistrict("");
            }}
            options={provinces
              .filter((p) => !fCountry || p.country?.country_id === fCountry)
              .map((p) => ({ value: p.province_id, label: p.province_name }))}
            placeholder="Todas"
          />
          <SearchSelect
            label="Cantón"
            value={fCity}
            onChange={(val) => {
              setFCity(val);
              setFDistrict("");
            }}
            options={cities
              .filter(
                (c) => !fProvince || c.province_id?.province_id === fProvince
              )
              .map((c) => ({ value: c.city_id, label: c.city_name }))}
            placeholder="Todos"
          />
          <SearchSelect
            label="Distrito"
            value={fDistrict}
            onChange={setFDistrict}
            options={districts
              .filter((d) => !fCity || d.city_id?.city_id === fCity)
              .map((d) => ({ value: d.district_id, label: d.district_name }))}
            placeholder="Todos"
          />
          <button
            onClick={() => {
              setFName("");
              setFLast("");
              setFSecondLast("");
              setFId("");
              setFUser("");
              setFPhone("");
              setFCountry("");
              setFProvince("");
              setFCity("");
              setFDistrict("");
            }}
            className="border w-full rounded px-2 py-1 bg-muted"
          >
            Limpiar filtros
          </button>
        </FiltersPanel>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 h-full">
          <CardHeader>
            <CardTitle>Usuarios que no han cambiado su contraseña</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[420px]">
            <p className="text-sm text-muted-foreground mb-3">
              Reporte placeholder; requiere endpoint futuro.
            </p>
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
            <div className="overflow-y-auto pr-2 flex-1" />
            <div className="mt-4 text-sm text-muted-foreground">Total: 0</div>
          </CardContent>
        </Card>
        <FiltersPanel title="Filtrar (contraseñas)">
          <div className="flex flex-col gap-3">
            <input className="border rounded px-2 py-1" placeholder="Nombre" />
            <input
              className="border rounded px-2 py-1"
              placeholder="Apellidos"
            />
            <input
              className="border rounded px-2 py-1"
              placeholder="Identificación"
            />
            <input
              className="border rounded px-2 py-1"
              placeholder="Username"
            />
            <div className="flex flex-col gap-2">
              <label className="font-medium">Rango fechas</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="border rounded px-2 py-1"
                  value={fDateFrom}
                  onChange={(e) => setFDateFrom(e.target.value)}
                />
                <input
                  type="date"
                  className="border rounded px-2 py-1"
                  value={fDateTo}
                  onChange={(e) => setFDateTo(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={() => {
                setFDateFrom("");
                setFDateTo("");
              }}
              className="border w-full rounded px-2 py-1 bg-muted"
            >
              Limpiar filtros
            </button>
          </div>
        </FiltersPanel>
      </div>
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
                  <TableHead>Total</TableHead>
                  <TableHead>Acumulados</TableHead>
                  <TableHead>Canjeados</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <div className="overflow-y-auto pr-2 flex-1">
              <Table>
                <TableBody>
                  {pointsReport.rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.user || "-"}</TableCell>
                      <TableCell>{r.total}</TableCell>
                      <TableCell>{r.accumulated}</TableCell>
                      <TableCell>{r.redeemed}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-3 border-t pt-3">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      {pointsReport.totals.user}
                    </TableCell>
                    <TableCell className="font-medium">
                      {pointsReport.totals.total}
                    </TableCell>
                    <TableCell className="font-medium">
                      {pointsReport.totals.accumulated}
                    </TableCell>
                    <TableCell className="font-medium">
                      {pointsReport.totals.redeemed}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <FiltersPanel title="Filtrar puntos">
          <div className="flex flex-col gap-2">
            <label className="font-medium">Fecha</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                className="border rounded px-2 py-1"
                value={fDateFrom}
                onChange={(e) => setFDateFrom(e.target.value)}
              />
              <input
                type="date"
                className="border rounded px-2 py-1"
                value={fDateTo}
                onChange={(e) => setFDateTo(e.target.value)}
              />
            </div>
            <small className="text-muted-foreground">
              Endpoint no soporta rango todavía.
            </small>
          </div>
        </FiltersPanel>
      </div>
    </div>
  );
}
