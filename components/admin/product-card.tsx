"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export interface AffiliatedBusinessProduct {
  affiliated_business_x_prod: string;
  product_price: number;
  product_id: {
    product_name: string;
    description: string | null;
    state?: string | null;
    product_id?: string; // por si el select directo incluya id
  };
  affiliated_business_id: {
    affiliated_business_name: string;
    description: string | null;
    affiliated_business_id?: string;
  };
  // Normalizado extra
  rawProductId?: string; // usado si no viene en nested
}

interface ProductCardProps {
  data: AffiliatedBusinessProduct;
  onStateChange?: () => Promise<void> | void;
  onEdit?: () => void;
}

// Intenta obtener URL pública de la imagen del bucket product_logo.
// Se prueban varios posibles nombres (id y nombre normalizado) con extensiones comunes.
async function resolveProductImage(productId: string | undefined, productName: string): Promise<string | null> {
  try {
    const supabase = createClient();
    const candidates: string[] = [];
    if (productId) candidates.push(productId);
    const slug = productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    candidates.push(slug);
    const exts = ["png", "jpg", "jpeg", "webp"]; // extensiones posibles
    for (const base of candidates) {
      for (const ext of exts) {
        const path = `${base}.${ext}`;
        const { data } = supabase.storage.from("product_logo").getPublicUrl(path);
        if (!data?.publicUrl) continue;
        // Verificar si existe realmente (HEAD)
        const head = await fetch(data.publicUrl, { method: "HEAD" });
        if (head.ok) return data.publicUrl;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function ProductCard({ data, onStateChange, onEdit }: ProductCardProps) {
  const productName = data.product_id.product_name;
  const description = data.product_id.description || "Sin descripción";
  const points = data.product_price;
  // El id puede venir anidado o solo en relación (no lo devuelve el select actual), se intenta deducir.
  const derivedId = (data as any).product_id?.product_id || data.rawProductId;
  const state = data.product_id.state || "active"; // default
  const inactive = state !== "active";

  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loadingImg, setLoadingImg] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadImg = useCallback(async () => {
    setLoadingImg(true);
    const url = await resolveProductImage(derivedId, productName);
    setImgUrl(url);
    setLoadingImg(false);
  }, [derivedId, productName]);

  useEffect(() => {
    loadImg();
  }, [loadImg]);

  async function toggleState() {
    if (!derivedId) return;
    try {
      setSaving(true);
      setError(null);
      const newState = inactive ? "active" : "inactive";
      const res = await fetch(`/api/products/${derivedId}/patch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: newState }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Error actualizando estado");
      if (onStateChange) await onStateChange();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`border rounded-xl p-4 flex flex-col justify-between gap-3 transition relative ${inactive ? "bg-gray-200 text-gray-600" : "bg-white"}`}
    >
      <div className="flex flex-col gap-3">
        <div className="w-full flex justify-center">
          {loadingImg ? (
            <div className="h-24 w-24 bg-muted animate-pulse rounded-full" />
          ) : imgUrl ? (
            <Image
              src={imgUrl}
              alt={productName}
              width={96}
              height={96}
              className="h-24 w-24 object-contain rounded-full"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-200 to-green-400 flex items-center justify-center text-sm font-semibold text-green-900">
              {productName.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <h3 className="font-semibold text-lg leading-tight line-clamp-2">{productName}</h3>
        <p className="text-sm leading-snug line-clamp-4">{description}</p>
        <p className="text-sm font-medium mt-1">{points} puntos</p>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <div className="flex gap-2 mt-2">
        <Button
          variant={inactive ? "success" : "warning"}
          className="flex-1 rounded-md"
          disabled={saving}
          onClick={toggleState}
        >
          {saving ? "..." : inactive ? "Activar" : "Desactivar"}
        </Button>
        <Button
          variant="success"
          className="flex-1 rounded-md"
          disabled={inactive || saving}
          onClick={onEdit}
        >
          Editar Producto
        </Button>
      </div>
    </div>
  );
}
