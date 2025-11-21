import EditarProductoClient from "./EditarProductoClient";
import { getProductsByAffiliatedBusinessId } from "@/lib/api/products";

interface ProductRelation {
  affiliated_business_x_prod: string;
  product_id: {
    product_id: string;
    product_name: string;
    description?: string | null;
  };
  affiliated_business_id: {
    affiliated_business_id: string;
    affiliated_business_name: string;
  };
  product_price: number;
}

interface RawProductRelation {
  affiliated_business_x_prod?: string;
  product_id?: {
    product_id?: string;
    product_name?: string;
    description?: string | null;
  };
  affiliated_business_id?: {
    affiliated_business_id?: string;
    affiliated_business_name?: string;
  };
  product_price?: number | string | null;
}

export const revalidate = 0;

export default async function EditarProductoPage({
  params,
}: {
  params: { id: string; relId: string };
}) {
  // `params` can be a Promise in some Next versions, await to be safe
  const { id: businessId, relId } = await params;
  console.log("businessId", businessId, "relId", relId);

  // Basic validation: avoid calling DB with missing/invalid ids
  if (!businessId || businessId === "undefined") {
    console.error("Invalid businessId in EditarProductoPage:", businessId);
    return (
      <EditarProductoClient
        businessId={String(businessId)}
        relId={String(relId)}
        initialRelation={null}
        initialRelations={[]}
        initialBusinessName={""}
      />
    );
  }

  const productsRes = await getProductsByAffiliatedBusinessId(businessId);
  console.log("productsRes", productsRes);
  const raw = (productsRes.data ?? []) as unknown[];
  const rawRelations = raw as RawProductRelation[];
  const allRelations: ProductRelation[] = rawRelations.map((r) => ({
    affiliated_business_x_prod: r.affiliated_business_x_prod || "",
    product_id: {
      product_id: r.product_id?.product_id || "",
      product_name: r.product_id?.product_name || "",
      description: r.product_id?.description ?? null,
    },
    affiliated_business_id: {
      affiliated_business_id:
        r.affiliated_business_id?.affiliated_business_id || "",
      affiliated_business_name:
        r.affiliated_business_id?.affiliated_business_name || "",
    },
    product_price: Number(r.product_price ?? 0),
  }));
  // Try to resolve the relation by the relation PK first; if not found,
  // allow resolving by the product_id so URLs using the product id work.
  let relation = allRelations.find((r) => r.affiliated_business_x_prod === relId) || null;
  if (!relation) {
    relation = allRelations.find((r) => r.product_id?.product_id === relId) || null;
  }
  const businessName =
    relation?.affiliated_business_id?.affiliated_business_name || "";
  return (
    <EditarProductoClient
      businessId={businessId}
      relId={relId}
      initialRelation={relation}
      initialRelations={allRelations}
      initialBusinessName={businessName}
    />
  );
}
