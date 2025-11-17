"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type BusinessType = { business_type_id: string; name: string };

interface BusinessData {
  affiliated_business_id: string;
  affiliated_business_name: string;
  description: string | null;
  phone: string | null;
  email?: { email?: string } | null;
  manager_id?: { first_name?: string | null; last_name?: string | null; second_last_name?: string | null } | null;
  business_type_id?: { name?: string | null } | null;
  district_id?: {
    district_name?: string | null;
    city_id?: {
      city_name?: string | null;
      province_id?: {
        province_name?: string | null;
        country_id?: { country_name?: string | null } | null;
      } | null;
    } | null;
  } | null;
}

function joinName(parts: (string | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export default function AdminComercioDetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [types, setTypes] = useState<BusinessType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editable fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [bRes, tRes] = await Promise.all([
        fetch(`/api/affiliatedbusiness/${id}/get`, { cache: "no-store" }),
        fetch(`/api/businesstypes/get`, { cache: "no-store" }),
      ]);
      const bJ = await bRes.json();
      const tJ = await tRes.json();
      if (!bRes.ok) throw new Error(bJ?.error || "Error cargando comercio");
      if (!tRes.ok) throw new Error(tJ?.error || "Error cargando tipos");
      const bData = bJ.data as BusinessData;
      setBusiness(bData);
      setTypes((tJ?.data || []) as BusinessType[]);
      setName(bData.affiliated_business_name || "");
      setDescription(bData.description || "");
      setSelectedType(bData.business_type_id?.name || "");
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) load();
  }, [id, load]);

  async function handleSave() {
    if (!business) return;
    try {
      setSaving(true);
      setSuccess(null);
      setError(null);
      // Resolve selected type id from name
      const typeObj = types.find((t) => t.name === selectedType);
      const payload: Record<string, unknown> = {
        affiliated_business_name: name,
        description,
      };
      if (typeObj) payload.business_type_id = typeObj.business_type_id;
      const res = await fetch(`/api/affiliatedbusiness/${business.affiliated_business_id}/patch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Error al guardar cambios");
      setSuccess("Cambios guardados correctamente");
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!business) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const res = await fetch(`/api/affiliatedbusiness/${business.affiliated_business_id}/deactivate`, {
        method: "POST",
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Error al desactivar");
      setSuccess("Comercio desactivado");
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al desactivar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!business) return;
    if (!confirm("¿Eliminar este comercio? Esta acción es permanente.")) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/affiliatedbusiness/${business.affiliated_business_id}/delete`, {
        method: "DELETE",
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Error al eliminar");
      router.push("/admin/consultas/comercios");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setSaving(false);
    }
  }

  const fullManagerName = joinName([
    business?.manager_id?.first_name,
    business?.manager_id?.last_name,
    business?.manager_id?.second_last_name,
  ]);
  const address = business
    ? [
        business.district_id?.district_name,
        business.district_id?.city_id?.city_name,
        business.district_id?.city_id?.province_id?.province_name,
        business.district_id?.city_id?.province_id?.country_id?.country_name,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 py-6 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Detalle del comercio</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Información del negocio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && <p className="text-sm">Cargando...</p>}
            {!loading && business && (
              <>
                {/* Nombre */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Nombre del negocio</label>
                  <input
                    className="border rounded px-3 py-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre"
                  />
                </div>
                {/* Gerente */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Nombre del encargado</label>
                  <input
                    className="border rounded px-3 py-2 bg-muted"
                    value={fullManagerName || "-"}
                    readOnly
                  />
                </div>
                {/* Dirección */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Dirección</label>
                  <input className="border rounded px-3 py-2 bg-muted" value={address} readOnly />
                </div>
                {/* Descripción */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Descripción</label>
                  <textarea
                    className="border rounded px-3 py-2 h-28 resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción del comercio"
                  />
                </div>
                {/* Tipo de comercio (selección única) */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Tipo de comercio</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {types.map((t) => {
                      const active = selectedType === t.name;
                      return (
                        <button
                          key={t.business_type_id}
                          type="button"
                          onClick={() => setSelectedType(t.name)}
                          className={`border rounded px-3 py-3 text-left text-sm flex items-center gap-2 transition ${
                            active ? "bg-green-50 border-green-500" : "bg-muted/40 hover:bg-muted"
                          }`}
                        >
                          <span className="inline-block w-4 text-center">{active ? "✔" : ""}</span>
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        {/* Panel de acciones */}
        <Card>
          <CardHeader>
            <CardTitle>Opciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="info"
              className="w-full rounded-xl"
              // Placeholder para "Ver productos"
              onClick={() => alert("Pendiente de implementación")}
              disabled={saving}
            >
              Ver productos
            </Button>
            <Button
              variant="default"
              className="w-full rounded-xl"
              onClick={handleSave}
              disabled={saving || loading}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
            <Button
              variant="warning"
              className="w-full rounded-xl"
              onClick={handleDeactivate}
              disabled={saving || loading}
            >
              Desactivar
            </Button>
            <Button
              variant="destructive"
              className="w-full rounded-xl"
              onClick={handleDelete}
              disabled={saving || loading}
            >
              Eliminar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
