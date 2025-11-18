"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
// Usamos endpoints /api para refresco para evitar importar funciones server en cliente.

interface BusinessType {
  business_type_id: string;
  name: string;
}

interface BusinessData {
  affiliated_business_id: string;
  affiliated_business_name: string;
  description: string | null;
  phone: string | null;
  email?: { email?: string } | null;
  manager_id?: {
    first_name?: string | null;
    last_name?: string | null;
    second_last_name?: string | null;
  } | null;
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

interface Props {
  id: string;
  initialBusiness: BusinessData | null;
  initialTypes: BusinessType[];
}

export default function ComercioDetalleClient({
  id,
  initialBusiness,
  initialTypes,
}: Props) {
  const router = useRouter();
  const [business, setBusiness] = useState<BusinessData | null>(
    initialBusiness
  );
  const [types, setTypes] = useState<BusinessType[]>(initialTypes);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [name, setName] = useState(business?.affiliated_business_name || "");
  const [description, setDescription] = useState(business?.description || "");
  const [selectedType, setSelectedType] = useState<string>(
    business?.business_type_id?.name || ""
  );

  async function refresh() {
    try {
      setLoading(true);
      const [bRes, tRes] = await Promise.all([
        fetch(`/api/affiliatedbusiness/${id}/get`, { cache: "no-store" }),
        fetch(`/api/businesstypes/get`, { cache: "no-store" }),
      ]);
      const bJ = await bRes.json();
      const tJ = await tRes.json();
      if (!bRes.ok) throw new Error(bJ?.error || "Error comercio");
      if (!tRes.ok) throw new Error(tJ?.error || "Error tipos");
      setBusiness((bJ.data as BusinessData) || null);
      setTypes((tJ.data ?? []) as BusinessType[]);
      if (bJ.data) {
        const bd = bJ.data as BusinessData;
        setName(bd.affiliated_business_name || "");
        setDescription(bd.description || "");
        setSelectedType(bd.business_type_id?.name || "");
      }
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error refrescando");
    } finally {
      setLoading(false);
    }
  }

  async function performSave() {
    if (!business) return;
    try {
      setSaving(true);
      setSuccess(null);
      setError(null);
      const typeObj = types.find((t) => t.name === selectedType);
      const payload: Record<string, unknown> = {
        affiliated_business_name: name,
        description,
      };
      if (typeObj) payload.business_type_id = typeObj.business_type_id;
      const res = await fetch(
        `/api/affiliatedbusiness/${business.affiliated_business_id}/patch`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Error al guardar cambios");
      setSuccess("Cambios guardados correctamente");
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function performDeactivate() {
    if (!business) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const res = await fetch(
        `/api/affiliatedbusiness/${business.affiliated_business_id}/deactivate`,
        { method: "POST" }
      );
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Error al desactivar");
      setSuccess("Comercio desactivado");
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al desactivar");
    } finally {
      setSaving(false);
    }
  }

  async function performDelete() {
    if (!business) return;
    try {
      setSaving(true);
      const res = await fetch(
        `/api/affiliatedbusiness/${business.affiliated_business_id}/delete`,
        { method: "DELETE" }
      );
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Detalle del comercio</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loading}
        >
          {loading ? "Actualizando..." : "Refrescar"}
        </Button>
      </div>
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
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">
                    Nombre del negocio
                  </label>
                  <input
                    className="border rounded px-3 py-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">
                    Nombre del encargado
                  </label>
                  <input
                    className="border rounded px-3 py-2 bg-muted"
                    value={fullManagerName || "-"}
                    readOnly
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Dirección</label>
                  <input
                    className="border rounded px-3 py-2 bg-muted"
                    value={address}
                    readOnly
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Descripción</label>
                  <textarea
                    className="border rounded px-3 py-2 h-28 resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción del comercio"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Tipo de comercio
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {types.map((t) => {
                      const active = selectedType === t.name;
                      return (
                        <button
                          key={t.business_type_id}
                          type="button"
                          onClick={() => setSelectedType(t.name)}
                          className={`border rounded px-3 py-3 text-left text-sm flex items-center gap-2 transition ${
                            active
                              ? "bg-green-50 border-green-500"
                              : "bg-muted/40 hover:bg-muted"
                          }`}
                        >
                          <span className="inline-block w-4 text-center">
                            {active ? "✔" : ""}
                          </span>
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
        <Card>
          <CardHeader>
            <CardTitle>Opciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="info"
              className="w-full rounded-xl"
              onClick={() =>
                router.push(`/admin/consultas/comercios/${id}/productos`)
              }
              disabled={saving}
            >
              Ver productos
            </Button>
            <Button
              variant="default"
              className="w-full rounded-xl"
              onClick={() => setShowSaveModal(true)}
              disabled={saving || loading}
            >
              {saving && showSaveModal ? "Guardando..." : "Guardar cambios"}
            </Button>
            <Button
              variant="warning"
              className="w-full rounded-xl"
              onClick={() => setShowDeactivateModal(true)}
              disabled={saving || loading}
            >
              Desactivar
            </Button>
            <Button
              variant="destructive"
              className="w-full rounded-xl"
              onClick={() => setShowDeleteModal(true)}
              disabled={saving || loading}
            >
              Eliminar
            </Button>
          </CardContent>
        </Card>
      </div>
      <Modal
        open={showSaveModal}
        title="¿Seguro de tus cambios?"
        onCancel={() => {
          if (!saving) setShowSaveModal(false);
        }}
        onConfirm={async () => {
          await performSave();
          setShowSaveModal(false);
        }}
        loading={saving}
      >
        <p className="text-sm">
          Has cambiado la información del comercio{" "}
          <strong>{name || business?.affiliated_business_name}</strong>. ¿Estás
          seguro?
        </p>
      </Modal>
      <Modal
        open={showDeactivateModal}
        title="¡Atención!"
        onCancel={() => {
          if (!saving) setShowDeactivateModal(false);
        }}
        onConfirm={async () => {
          await performDeactivate();
          setShowDeactivateModal(false);
        }}
        loading={saving}
      >
        <p className="text-sm">
          Vas a desactivar este comercio{" "}
          <strong>{name || business?.affiliated_business_name}</strong>. ¿Estás
          seguro?
        </p>
      </Modal>
      <Modal
        open={showDeleteModal}
        title="¡Cuidado vas a eliminar un comercio!"
        onCancel={() => {
          if (!saving) setShowDeleteModal(false);
        }}
        onConfirm={async () => {
          await performDelete();
          setShowDeleteModal(false);
        }}
        loading={saving}
        dangerNote="¡Esta acción no se puede deshacer!"
      >
        <p className="text-sm">
          Has seleccionado el comercio{" "}
          <strong>{name || business?.affiliated_business_name}</strong> para ser
          eliminado. ¿Estás seguro?
        </p>
      </Modal>
    </div>
  );
}