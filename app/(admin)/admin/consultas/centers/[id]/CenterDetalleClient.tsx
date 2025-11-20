"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface CenterData {
  collectioncenter_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  person_id?: { first_name?: string | null; last_name?: string | null } | null;
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
  latitude?: number | null;
  longitude?: number | null;
}

interface MaterialData {
  material_id?: string | { material_id?: string; name?: string }; // tipos posibles devueltos por RPC
  name?: string;
  material_name?: string; // posible alias desde RPC
}

interface Props {
  id: string;
  initialCenter: CenterData | null;
  initialCenterMaterials: MaterialData[];
  initialAllMaterials: MaterialData[];
}

function joinName(parts: (string | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export default function CenterDetalleClient({ id, initialCenter, initialCenterMaterials, initialAllMaterials }: Props) {
  const router = useRouter();
  const [center, setCenter] = useState<CenterData | null>(initialCenter);
  const [centerMaterials, setCenterMaterials] = useState<MaterialData[]>(initialCenterMaterials);
  const [allMaterials, setAllMaterials] = useState<MaterialData[]>(initialAllMaterials);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [name, setName] = useState(center?.name || "");
  const [phone, setPhone] = useState(center?.phone || "");

  function extractMaterial(row: MaterialData | undefined) {
    if (!row) return { id: "", name: "" };
    let id = "";
    let nm = "";
    const raw = row.material_id;
    if (typeof raw === "string") id = raw;
    else if (raw && typeof raw === "object") {
      if (typeof raw.material_id === "string") id = raw.material_id;
      if (typeof raw.name === "string") nm = raw.name;
    }
    if (!nm && typeof row.name === "string") nm = row.name;
    if (!nm && typeof row.material_name === "string") nm = row.material_name;
    if (!id) id = nm; // fallback
    return { id, name: nm };
  }

  // Obtiene el nombre del material independientemente de la forma en que venga
  function getMaterialName(row: MaterialData | undefined) {
    if (!row) return "";
    if (row.name) return row.name;
    if (row.material_name) return row.material_name;
    if (row.material_id && typeof row.material_id === "object" && row.material_id.name) return row.material_id.name;
    return "";
  }

  async function refresh() {
    try {
      setLoading(true);
      const [cRes, cmRes, amRes] = await Promise.all([
        fetch(`/api/collectioncenters/${id}/get`, { cache: "no-store" }),
        fetch(`/api/collectioncenters/${id}/collectioncenterxmaterials/get`, { cache: "no-store" }),
        fetch(`/api/materials/get`, { cache: "no-store" }),
      ]);
      const cJ = await cRes.json();
      const cmJ = await cmRes.json();
      const amJ = await amRes.json();
      if (!cRes.ok) throw new Error(cJ?.error || "Error centro");
      if (!cmRes.ok) throw new Error(cmJ?.error || "Error materiales centro");
      if (!amRes.ok) throw new Error(amJ?.error || "Error todos materiales");
      setCenter(cJ || null);
      const updatedCenterMaterials = (cmJ ?? []) as MaterialData[];
      setCenterMaterials(updatedCenterMaterials);
      setAllMaterials((amJ.data ?? amJ ?? []) as MaterialData[]);
      if (cJ) {
        setName(cJ.name || "");
        setPhone(cJ.phone || "");
      }
      // Recalcular selección al refrescar usando coincidencia por nombre
      const refreshedCenterNames = new Set(updatedCenterMaterials.map(m => getMaterialName(m)).filter(Boolean));
      const refreshedIds = allMaterials
        .filter(am => refreshedCenterNames.has(getMaterialName(am)))
        .map(am => extractMaterial(am).id)
        .filter(Boolean);
      setSelectedMaterialIds(refreshedIds);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error refrescando");
    } finally {
      setLoading(false);
    }
  }

  // Selección inicial basada en nombres (garantiza usar IDs reales de allMaterials)
  const centerNames = new Set(centerMaterials.map(m => getMaterialName(m)).filter(Boolean));
  const initialIds = allMaterials
    .filter(am => centerNames.has(getMaterialName(am)))
    .map(am => extractMaterial(am).id)
    .filter(Boolean);
  const [baselineIds, setBaselineIds] = useState<string[]>(initialIds);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>(baselineIds);

  async function performSave() {
    if (!center) return;
    try {
      setSaving(true);
      setSuccess(null);
      setError(null);
      const payload: Record<string, unknown> = { name, phone };
      const res = await fetch(`/api/collectioncenters/${center.collectioncenter_id}/patch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Error al guardar cambios");
      // Diff materiales
      const originalSet = new Set(baselineIds);
      const newSet = new Set(selectedMaterialIds);
      const toAdd = [...newSet].filter(id => !originalSet.has(id));
      const toRemove = [...originalSet].filter(id => !newSet.has(id));

      for (const addId of toAdd) {
        const mat = allMaterials.find(m => {
          const ex = extractMaterial(m);
          return ex.id === addId || ex.name === addId;
        });
        const matName = mat ? extractMaterial(mat).name : "";
        if (!matName) continue;
        await fetch(`/api/collectioncenterxmaterials/post`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            material_name: matName,
            collection_center_name: name || center.name,
          }),
        }).catch(() => {});
      }

      for (const delId of toRemove) {
        const mat = allMaterials.find(m => {
          const ex = extractMaterial(m);
          return ex.id === delId || ex.name === delId;
        });
        const matName = mat ? extractMaterial(mat).name : "";
        await fetch(`/api/collectioncenterxmaterials/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            material_name: matName,
            collection_center_id: center.collectioncenter_id,
          }),
        }).catch(() => {});
      }

      setSuccess(`Cambios guardados correctamente. (+${toAdd.length} / -${toRemove.length} materiales)`);
      setBaselineIds(selectedMaterialIds); // actualizar línea base local antes del refresh
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function performDelete() {
    if (!center) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/collectioncenters/${center.collectioncenter_id}/delete`, { method: "DELETE" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Error al eliminar");
      router.push("/admin/consultas/centers");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setSaving(false);
    }
  }

  const managerName = joinName([center?.person_id?.first_name, center?.person_id?.last_name]);
  const address = center
    ? [
        center.district_id?.district_name,
        center.district_id?.city_id?.city_name,
        center.district_id?.city_id?.province_id?.province_name,
        center.district_id?.city_id?.province_id?.country_id?.country_name,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  function toggleMaterial(id: string) {
    setSelectedMaterialIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const selectedSet = new Set(selectedMaterialIds);

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Detalle del Centro</h1>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Información del centro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && <p className="text-sm">Cargando...</p>}
            {!loading && center && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">
                    Nombre del centro
                  </label>
                  <input
                    className="border rounded px-3 py-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">
                    Nombre del gerente
                  </label>
                  <input
                    className="border rounded px-3 py-2 bg-muted"
                    value={managerName || "-"}
                    readOnly
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Teléfono</label>
                  <input
                    className="border rounded px-3 py-2"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Correo</label>
                  <input
                    className="border rounded px-3 py-2 bg-muted"
                    value={center.email || "-"}
                    readOnly
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Dirección</label>
                  <input
                    className="border rounded px-3 py-2 bg-muted"
                    value={address || "-"}
                    readOnly
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Tipos de Materiales
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {allMaterials.map((m, i) => {
                      const ex = extractMaterial(m);
                      const matName = ex.name || "Material";
                      const matId = ex.id || matName;
                      const selected = selectedSet.has(matId);
                      return (
                        <div
                          key={matId + i}
                          role="button"
                          onClick={() => toggleMaterial(matId)}
                          className={`cursor-pointer border rounded px-3 py-3 text-sm flex items-center gap-2 transition select-none ${
                            selected
                              ? "bg-green-50 border-green-600"
                              : "bg-muted/40 hover:bg-muted"
                          }`}
                          aria-pressed={selected}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleMaterial(matId)}
                            className="h-4 w-4"
                          />
                          {matName}
                        </div>
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
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() =>
                router.push(`/admin/consultas/centers/${id}/stats`)
              }
              disabled={saving || loading}
            >
              Ver estadísticas
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
          Se guardarán los cambios del centro{" "}
          <strong>{name || center?.name}</strong>. ¿Continuar?
        </p>
      </Modal>
      <Modal
        open={showDeleteModal}
        title="¡Cuidado!"
        dangerNote="¡Esta acción no se puede deshacer!"
        onCancel={() => {
          if (!saving) setShowDeleteModal(false);
        }}
        onConfirm={async () => {
          await performDelete();
          setShowDeleteModal(false);
        }}
        loading={saving}
      >
        <p className="text-sm">
          Eliminarás el centro <strong>{name || center?.name}</strong>. ¿Estás
          seguro?
        </p>
      </Modal>
    </div>
  );
}
