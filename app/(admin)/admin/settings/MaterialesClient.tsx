"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface MaterialRow {
  material_id: string;
  name: string;
  equivalent_points: number | string | null;
  unit_id?: { unit_id?: string; unit_name?: string | null };
  updated_by?: string | null; // UUID del usuario que modificó
}

interface PersonRow { user_id: string; first_name?: string | null; last_name?: string | null }

interface Props {
  initialMaterials: unknown[];
  persons?: unknown[];
}

function normalizeNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export default function MaterialesClient({ initialMaterials, persons }: Props) {
  const [search, setSearch] = useState("");
  const [materials] = useState<MaterialRow[]>(initialMaterials as MaterialRow[]);
  const people = (persons as PersonRow[] | undefined) ?? [];

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return materials;
    return materials.filter(m => m.name.toLowerCase().includes(s));
  }, [materials, search]);

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 py-6 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Panel de materiales</h1>
      <p className="text-sm text-muted-foreground -mt-3 mb-2">¡Bienvenido! Gestiona los diversos materiales a recaudar desde aquí</p>

      <Card className="bg-white/50 backdrop-blur">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none md:w-72">
              <input
                placeholder="Buscar"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-full border px-4 py-2 bg-muted focus:outline-none"
                aria-label="Buscar material"
              />
            </div>
            <Button asChild variant="success">
              <Link href="/admin/settings/materiales/agregar">Agregar material</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="py-2 font-medium w-16">Foto</th>
                  <th className="py-2 font-medium">Material</th>
                  <th className="py-2 font-medium">Unidad</th>
                  <th className="py-2 font-medium">Puntos por unidad</th>
                  <th className="py-2 font-medium">Modificado por</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => {
                  const puntos = normalizeNumber(m.equivalent_points);
                  const unidad = m.unit_id?.unit_name ?? "-";
                  const modificado = (() => {
                    const uid = m.updated_by;
                    if (!uid) return "-";
                    const p = people.find(x => x.user_id === uid);
                    if (!p) return "-";
                    return `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "-";
                  })();
                  return (
                    <tr key={m.material_id} className="border-b last:border-b-0">
                      <td className="py-2">
                        <MaterialAvatar id={m.material_id} name={m.name} />
                      </td>
                      <td className="py-2">{m.name}</td>
                      <td className="py-2">{unidad}</td>
                      <td className="py-2">{puntos}</td>
                      <td className="py-2">{modificado}</td>
                      <td className="py-2">
                        <Button asChild variant="warning" size="sm">
                          <Link href={`/admin/settings/materiales/${m.material_id}`}>Editar material</Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground text-xs">
                      No hay materiales que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


function MaterialAvatar({ id, name }: { id: string; name: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  useEffect(() => {
    let active = true;
    async function probe() {
      if (!base) return;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const candidates = [id, slug].filter(Boolean);
      const exts = ["png", "jpg", "jpeg", "webp"]; // orden de preferencia
      for (const c of candidates) {
        for (const ext of exts) {
          const url = `${base}/storage/v1/object/public/material_logo/${c}.${ext}`;
          try {
            const res = await fetch(url, { method: "HEAD" });
            if (res.ok) {
              if (active) setImageUrl(url);
              return;
            }
          } catch {
            // ignorar
          }
        }
      }
    }
    void probe();
    return () => { active = false; };
  }, [id, name, base]);

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={42}
        height={42}
        className="h-10 w-10 rounded-md object-cover bg-muted"
      />
    );
  }
  return (
    <div className="h-10 w-10 rounded-md bg-gradient-to-br from-green-200 to-green-400 flex items-center justify-center text-xs font-semibold text-green-900">
      {name.substring(0, 2).toUpperCase()}
    </div>
  );
}
