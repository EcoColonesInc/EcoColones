"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

interface UnitRow { unit_id: string; unit_name: string; unit_exchange?: number | string | null }
interface MaterialRow { material_id: string; name: string; equivalent_points: number | string | null; unit_id?: { unit_id: string; unit_name?: string } }

interface Props {
  mode: "create" | "edit";
  initialMaterial: unknown | null;
  units: unknown[];
}

export default function MaterialFormClient({ mode, initialMaterial, units }: Props) {
  const router = useRouter();
  const material = (initialMaterial as MaterialRow | null) || null;
  const unitList = units as UnitRow[];

  const [name, setName] = useState<string>(material?.name || "");
  const [unitName, setUnitName] = useState<string>(material?.unit_id?.unit_name || "");
  const [points, setPoints] = useState<string>(material?.equivalent_points != null ? String(material.equivalent_points) : "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  // Resolve existing image when editing
  async function resolveImage(id?: string, materialName?: string) {
    if (!id && !materialName) return;
    try {
      const supabase = createClient();
      const candidates: string[] = [];
      if (id) candidates.push(id);
      if (materialName) {
        const slug = materialName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        candidates.push(slug);
      }
      const exts = ["png", "jpg", "jpeg", "webp"];
      for (const base of candidates) {
        for (const ext of exts) {
          const path = `${base}.${ext}`;
          const { data } = supabase.storage.from("material_logo").getPublicUrl(path);
          const url = data?.publicUrl;
          if (!url) continue;
          // Directly set the public URL. If the file exists it will load; if not, the image element will show nothing.
          setImgUrl(url);
          return;
        }
      }
    } catch {
      // ignore
    }
  }

  // On mount for edit mode: run inside useEffect to avoid side-effects during render
  useEffect(() => {
    if (mode === "edit" && material && !imgUrl) {
      void resolveImage(material.material_id, material.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, material?.material_id, material?.name]);

  // Revoke preview object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  function validate(): boolean {
    if (!name.trim()) { setError("El nombre es requerido"); return false; }
    if (!unitName.trim()) { setError("La unidad es requerida"); return false; }
    if (!/^\d+$/.test(points)) { setError("Los puntos deben ser número entero"); return false; }
    setError(null);
    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;
    try {
      setSaving(true);
      setSuccess(null);
      const body = { name, unit_name: unitName, equivalent_points: parseInt(points, 10) };
      let materialId = material?.material_id || null;
      if (mode === "create") {
        const res = await fetch("/api/materials/post", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error || "Error creando material");
        materialId = j?.data?.[0]?.material_id;
        setSuccess("Material creado correctamente");
      } else {
        const newUnit = unitList.find(u => u.unit_name === unitName);
        const res = await fetch(`/api/materials/${materialId}/patch`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, equivalent_points: parseInt(points,10), unit_id: newUnit?.unit_id }) });
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error || "Error actualizando material");
        setSuccess("Material actualizado correctamente");
      }

      // Upload image if chosen
      if (materialId && fileInputRef.current?.files?.length) {
        await uploadImage(materialId);
      }

      // Redirect after short delay
      setTimeout(() => { router.push("/admin/settings/materiales"); }, 800);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(materialId: string) {
    try {
      setUploadingImg(true);
      const file = fileInputRef.current?.files?.[0];
      if (!file) return;
      const supabase = createClient();
      const exts = ["png", "jpg", "jpeg", "webp"];
      // remove previous variants
      await supabase.storage.from("material_logo").remove(exts.map(e => `${materialId}.${e}`));
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `${materialId}.${ext}`;
      const { error: upErr } = await supabase.storage.from("material_logo").upload(path, file, { upsert: true, cacheControl: "3600", contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("material_logo").getPublicUrl(path);
      setImgUrl(data?.publicUrl || null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error subiendo imagen");
    } finally {
      setUploadingImg(false);
    }
  }

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 py-6 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold">{mode === "create" ? "Agregar material" : "Editar material"}</h1>
      <Card className="bg-white/60">
        <CardHeader>
          <CardTitle className="text-base">Información</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-700">{success}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Tipo de material</label>
                <input
                  className="border rounded px-3 py-2"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nombre"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Unidades</label>
                <select
                  className="border rounded px-3 py-2"
                  value={unitName}
                  onChange={e => setUnitName(e.target.value)}
                >
                  <option value="">Seleccione la unidad</option>
                  {unitList.map(u => (
                    <option key={u.unit_id} value={u.unit_name}>{u.unit_name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Puntos por unidad</label>
                <input
                  className="border rounded px-3 py-2"
                  value={points}
                  onChange={e => setPoints(e.target.value)}
                  inputMode="numeric"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <label className="text-sm font-medium w-full">Foto</label>
              <div className="w-72 h-72 border rounded flex items-center justify-center bg-muted relative overflow-hidden">
                {localPreview || imgUrl ? (
                  <Image src={localPreview || imgUrl || ""} alt={name || "material"} fill className="object-contain p-4" />
                ) : (
                  <span className="text-xs text-muted-foreground">Sin imagen</span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = URL.createObjectURL(f);
                  // revoke previous preview if any
                  if (previewUrlRef.current) {
                    URL.revokeObjectURL(previewUrlRef.current);
                  }
                  previewUrlRef.current = url;
                  setLocalPreview(url);
                }}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingImg || saving}>Seleccionar</Button>
                <Button
                  variant="success"
                  disabled={uploadingImg || saving || !fileInputRef.current?.files?.length}
                  onClick={async () => {
                    if (mode === "edit") {
                      if (material?.material_id) await uploadImage(material.material_id);
                    } else {
                      setError("Sube la imagen después de guardar el material");
                    }
                  }}
                >
                  {uploadingImg ? "Subiendo..." : "Guardar imagen"}
                </Button>
              </div>
              {mode === "create" && <p className="text-xs text-muted-foreground">Primero guarda el material para poder asociar la imagen.</p>}
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="success" disabled={saving} onClick={handleSubmit}>{saving ? "Guardando..." : (mode === "create" ? "Guardar" : "Actualizar")}</Button>
            <Button variant="destructive" onClick={() => router.push("/admin/settings/materiales")}>Cancelar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
