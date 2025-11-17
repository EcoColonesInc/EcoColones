"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductCard, AffiliatedBusinessProduct } from "@/components/admin/product-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RelationRow {
  affiliated_business_x_prod: string;
  product_price: number;
  product_id: { product_id?: string; product_name: string; description: string | null; state?: string | null };
  affiliated_business_id: { affiliated_business_name: string; description: string | null; affiliated_business_id?: string };
}

export default function ProductosComercioPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relations, setRelations] = useState<RelationRow[]>([]);
  const [search, setSearch] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  // Nombre del comercio (derivado de los datos cargados o fallback al param id)
  const [businessName, setBusinessName] = useState<string>("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/affiliatedbusinessxproduct/get`, { cache: "no-store" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Error obteniendo productos");
      const raw: RelationRow[] = j.data || [];
      // Filtrar por el negocio actual (intentamos comparar por id si lo trae, sino por nombre) - el get actual trae nested sin id del business, depende del select en backend.
      const filtered = raw.filter(r => {
        const nestedId = r.affiliated_business_id.affiliated_business_id;
        if (nestedId) return nestedId === businessId;
        // fallback (no ideal): comparar nombre si param id es nombre
        return businessId && r.affiliated_business_id.affiliated_business_name?.toLowerCase() === businessId.toLowerCase();
      });
      setRelations(filtered);
      // Derivar nombre del comercio si existe en los registros; fallback al param
      const name = filtered[0]?.affiliated_business_id?.affiliated_business_name || businessId || "";
      setBusinessName(name);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) load();
  }, [businessId, load, refreshTick]);

  function handleRefresh() {
    setRefreshTick(x => x + 1);
  }

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
        <CardHeader>
          <CardTitle>Productos registrados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              aria-label="Buscar producto"
              placeholder="Buscar Producto"
              className="w-full md:max-w-xl border rounded-full px-4 py-2 bg-green-50 focus:outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={handleRefresh}>Refrescar</Button>
          </div>
          {loading && <p className="text-sm">Cargando productos...</p>}
          {!loading && displayed.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay productos que coincidan.</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map(rel => (
              <ProductCard
                key={rel.affiliated_business_x_prod}
                data={rel}
                onStateChange={async () => {
                  await load();
                }}
                onEdit={() => router.push(`/admin/consultas/comercios/${businessId}/productos/${rel.affiliated_business_x_prod}`)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
