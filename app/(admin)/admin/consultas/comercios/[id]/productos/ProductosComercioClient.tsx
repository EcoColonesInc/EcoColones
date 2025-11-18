// Removed unnecessary eslint-disable any
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductCard, AffiliatedBusinessProduct } from "@/components/admin/product-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RelationRow {
  affiliated_business_x_prod: string;
  product_price: number;
  product_id: { product_id?: string; product_name: string; description: string | null; state?: string | null };
  affiliated_business_id: { affiliated_business_name: string; description: string | null; affiliated_business_id?: string };
}

interface Props {
  businessId: string;
  initialRelations: RelationRow[];
  initialBusinessName: string;
}

export default function ProductosComercioClient({ businessId, initialRelations, initialBusinessName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relations, setRelations] = useState<RelationRow[]>(initialRelations);
  const [search, setSearch] = useState("");
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [refreshTick, setRefreshTick] = useState(0);

  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(`/api/affiliatedbusinessxproduct/${businessId}/get`, { cache: "no-store" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Error obteniendo productos");
      const raw: RelationRow[] = j.data || [];
      setRelations(raw);
      if (raw.length > 0) {
        setBusinessName(raw[0].affiliated_business_id.affiliated_business_name);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally { setLoading(false); }
  }, [businessId]);

  useEffect(() => { load(); }, [load, refreshTick]);

  const displayed: AffiliatedBusinessProduct[] = relations
    .filter(r => r.product_id.product_name.toLowerCase().includes(search.toLowerCase()))
    .map(r => ({ ...r }));

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 py-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold">Productos del comercio</h1>
          {businessName && (
            <p className="text-sm md:text-base text-muted-foreground">Comercio: <span className="font-semibold">{businessName}</span></p>
          )}
        </div>
        <Button variant="secondary" onClick={() => router.push(`/admin/consultas/comercios/${businessId}`)}>Volver</Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Card>
        <CardHeader><CardTitle>Productos registrados</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input aria-label="Buscar producto" placeholder="Buscar Producto" className="w-full md:max-w-xl border rounded-full px-4 py-2 bg-green-50 focus:outline-none" value={search} onChange={e => setSearch(e.target.value)} />
            <Button variant="outline" onClick={() => setRefreshTick(x => x + 1)}>Refrescar</Button>
          </div>
          {loading && <p className="text-sm">Cargando productos...</p>}
          {!loading && relations.length === 0 && (
            <p className="text-sm text-muted-foreground">Este comercio no tiene productos registrados.</p>
          )}
          {!loading && relations.length > 0 && displayed.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay productos que coincidan con la búsqueda.</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map(rel => (
              <ProductCard
                key={rel.affiliated_business_x_prod}
                data={rel}
                onStateChange={async () => { await load(); }}
                onEdit={() => router.push(`/admin/consultas/comercios/${businessId}/productos/${rel.affiliated_business_x_prod}`)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}