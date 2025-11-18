import { getProductsByAffiliatedBusinessId } from "@/lib/api/products";
import { getAffiliatedBusinessById } from "@/lib/api/affiliatedbusiness";
import ProductosComercioClient from "./ProductosComercioClient";

interface PageParams {
  id: string;
}

// Mantiene tipos consistentes con ProductosComercioClient
interface RelationRow {
  affiliated_business_x_prod: string;
  product_price: number;
  product_id: {
    product_id?: string;
    product_name: string;
    description: string | null;
    state?: string | null;
  };
  affiliated_business_id: {
    affiliated_business_name: string;
    description: string | null;
    affiliated_business_id?: string;
  };
}

export default async function ProductosComercioPage({
  params,
}: {
  params: PageParams;
}) {
  const id = params.id;
  const [productsRes, businessRes] = await Promise.all([
    getProductsByAffiliatedBusinessId(id),
    getAffiliatedBusinessById(id),
  ]);
  // Doble casteo via unknown para evitar incompatibilidad estructural reportada por TS
  const initial = (productsRes.data ?? []) as unknown as RelationRow[];
  const businessName = businessRes.data?.affiliated_business_name || "";
  return (
    <ProductosComercioClient
      businessId={id}
      initialRelations={initial}
      initialBusinessName={businessName}
    />
  );
}
