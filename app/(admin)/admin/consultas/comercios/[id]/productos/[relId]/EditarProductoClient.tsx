"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/utils/supabase/client";

interface EditarProductoClientProps {
  businessId: string;
  relId: string;
  initialRelation: any | null;
  initialRelations: any[];
  initialBusinessName: string;
}

export default function EditarProductoClient({ businessId, relId, initialRelation, initialRelations, initialBusinessName }: EditarProductoClientProps) {
  const router = useRouter();
  const [relation, setRelation] = useState<any | null>(initialRelation);
  const [allRelations, setAllRelations] = useState<any[]>(initialRelations);
  const [businessName] = useState<string>(initialBusinessName);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState<boolean>(!initialRelation);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState<string>(initialRelation?.product_id?.product_name || "");
  const [price, setPrice] = useState<string>(initialRelation?.product_price != null ? String(initialRelation.product_price) : "");
  const [description, setDescription] = useState<string>(initialRelation?.product_id?.description || "");
  const [priceError, setPriceError] = useState<string | null>(null);

  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const validatePrice = (value: string) => {
    setPrice(value);
    if (value.trim() === "") return setPriceError("El precio es requerido");
    if (!/^\d+$/.test(value)) return setPriceError("El precio debe ser un número entero");
    setPriceError(null);
  };

  const resolveProductImage = useCallback(async (productId: string, productName: string) => {
    try {
      const supabase = createClient();
      const candidates: string[] = [];
      if (productId) candidates.push(productId);
      const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      candidates.push(slug);
      const exts = ["png", "jpg", "jpeg", "webp"];
      for (const base of candidates) {
        for (const ext of exts) {
          const path = `${base}.${ext}`;
          const { data } = supabase.storage.from("product_logo").getPublicUrl(path);
          if (!data?.publicUrl) continue;
          const head = await fetch(data.publicUrl, { method: "HEAD" });
          if (head.ok) return data.publicUrl;
        }
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/affiliatedbusinessxproduct/get`, { cache: "no-store" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Error cargando producto");
      const list: any[] = j.data as any[];
      const r: any | undefined = list.find((x) => x.affiliated_business_x_prod === relId);
      if (!r) throw new Error("Relación no encontrada");
      setRelation(r);
      const sameBusiness = list.filter(
        (x) => x.affiliated_business_id?.affiliated_business_name === r.affiliated_business_id?.affiliated_business_name
      );
      setAllRelations(sameBusiness);
      setName(r.product_id.product_name || "");
      setDescription(r.product_id.description || "");
      setPrice(String(r.product_price ?? ""));
      const url = await resolveProductImage(r.product_id.product_id, r.product_id.product_name);
      setImgUrl(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }, [relId, resolveProductImage]);

  useEffect(() => {
    if (relation && !imgUrl) {
      (async () => {
        const url = await resolveProductImage(relation.product_id.product_id, relation.product_id.product_name);
        setImgUrl(url);
      })();
    }
  }, [relation, imgUrl, resolveProductImage]);

  const handleSave = async () => {
    if (!relation) return;
    if (priceError || !/^\d+$/.test(price)) {
      setPriceError("El precio debe ser un número entero");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const updates: Promise<Response>[] = [
        fetch(`/api/products/${relation.product_id.product_id}/patch`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_name: name, description }),
        }),
        fetch(`/api/affiliatedbusinessxproduct/${relation.affiliated_business_x_prod}/patch`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_price: parseInt(price, 10) }),
        }),
      ];
      const responses = await Promise.all(updates);
      for (const res of responses) {
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || "Error al guardar");
        }
      }
      setSuccess("Producto actualizado correctamente");
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!relation) return;
    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`/api/affiliatedbusinessxproduct/${relation.affiliated_business_x_prod}/delete`, {
        method: "DELETE",
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Error al eliminar");
      router.push(`/admin/consultas/comercios/${businessId}/productos`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setSaving(false);
    }
  };

  // Modales
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 py-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Editar producto</h1>
          {businessName && <p className="text-sm text-muted-foreground">Comercio: <span className="font-semibold">{businessName}</span></p>}
        </div>
        <Button variant="secondary" onClick={() => router.push(`/admin/consultas/comercios/${businessId}/productos`)}>Volver</Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
      <Card className="bg-green-50/40 max-w-5xl mx-auto">
        <CardHeader className="py-3">
          <CardTitle className="text-base">Información</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading || !relation ? (
            <p className="text-sm">Cargando...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-center">
              <div className="flex flex-col items-center justify-center self-center gap-2">
                {imgUrl ? (
                  <Image src={localPreview || imgUrl} alt={name} width={220} height={220} className="rounded-lg object-contain" />
                ) : (
                  <div className="h-52 w-52 rounded-lg bg-gradient-to-br from-green-200 to-green-400 flex items-center justify-center text-2xl font-semibold text-green-900">
                    {name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = URL.createObjectURL(f);
                      setLocalPreview(url);
                    }}
                  />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingImg}>Cambiar imagen</Button>
                  <Button
                    variant="success"
                    disabled={uploadingImg || !fileInputRef.current?.files?.length}
                    onClick={async () => {
                      if (!relation) return;
                      const file = fileInputRef.current?.files?.[0];
                      if (!file) return;
                      try {
                        setUploadingImg(true);
                        setError(null);
                        const supabase = createClient();
                        const productId = relation.product_id.product_id;
                        const exts = ["png", "jpg", "jpeg", "webp"];
                        await supabase.storage.from("product_logo").remove(exts.map((e) => `${productId}.${e}`));
                        const ext = (file.name.split(".").pop() || "png").toLowerCase();
                        const path = `${productId}.${ext}`;
                        const { error: upErr } = await supabase.storage.from("product_logo").upload(path, file, {
                          upsert: true,
                          cacheControl: "3600",
                          contentType: file.type,
                        });
                        if (upErr) throw upErr;
                        const { data } = supabase.storage.from("product_logo").getPublicUrl(path);
                        setImgUrl(data?.publicUrl || null);
                        setLocalPreview(null);
                        setSuccess("Imagen actualizada");
                      } catch (e: unknown) {
                        setError(e instanceof Error ? e.message : "Error subiendo imagen");
                      } finally {
                        setUploadingImg(false);
                      }
                    }}
                  >
                    {uploadingImg ? "Subiendo..." : "Guardar imagen"}
                  </Button>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Nombre</label>
                  <input className="border rounded px-3 py-1.5" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Precio</label>
                  <input
                    className={`border rounded px-3 py-1.5 ${priceError ? "border-red-500" : ""}`}
                    value={price}
                    onChange={(e) => validatePrice(e.target.value)}
                    inputMode="numeric"
                  />
                  {priceError && <span className="text-xs text-red-600">{priceError}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Descripción</label>
                  <textarea
                    className="border rounded px-3 py-2 h-20 resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 pt-0.5">
                  <Button variant="close" className="min-w-32" disabled={saving} onClick={() => setShowDeleteModal(true)}>Eliminar</Button>
                  <Button variant="success" className="min-w-32" disabled={saving} onClick={() => setShowSaveModal(true)}>
                    {saving ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!loading && allRelations.length > 0 && (
        <Card className="max-w-5xl mx-auto">
          <CardHeader className="py-3">
            <CardTitle className="text-base">Productos Registrados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center gap-3">
              <input
                aria-label="Buscar producto"
                placeholder="Buscar Producto"
                className="w-full md:max-w-xl border rounded-full px-4 py-2 bg-green-50 focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {allRelations
                .filter((r) => r.product_id.product_name.toLowerCase().includes(search.toLowerCase()))
                .map((r) => (
                  <div key={r.affiliated_business_x_prod} className="border rounded-lg p-2 bg-white flex flex-col gap-1">
                    <div className="font-semibold text-sm line-clamp-1">{r.product_id.product_name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{r.product_id.description || ""}</div>
                    <div className="text-xs">Precio: {r.product_price} Puntos</div>
                    <Button
                      variant={r.affiliated_business_x_prod === relation?.affiliated_business_x_prod ? "info" : "success"}
                      onClick={() => router.push(`/admin/consultas/comercios/${businessId}/productos/${r.affiliated_business_x_prod}`)}
                    >
                      {r.affiliated_business_x_prod === relation?.affiliated_business_x_prod ? "Editando" : "Editar"}
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Modal
        open={showSaveModal}
        title="¿Seguro de tus cambios?"
        onCancel={() => { if (!saving) setShowSaveModal(false); }}
        onConfirm={async () => { await handleSave(); setShowSaveModal(false); }}
        loading={saving}
      >
        <p className="text-sm">Has cambiado la información de <strong>{name}</strong>. ¿Estás seguro?</p>
      </Modal>
      <Modal
        open={showDeleteModal}
        title="¡Cuidado vas a eliminar un producto!"
        onCancel={() => { if (!saving) setShowDeleteModal(false); }}
        onConfirm={async () => { await handleDelete(); setShowDeleteModal(false); }}
        loading={saving}
        dangerNote="¡Esta acción no se puede deshacer!"
      >
        <p className="text-sm">Has seleccionado <strong>{name}</strong> para ser eliminado. ¿Estás seguro?</p>
      </Modal>
    </div>
  );
}
