import EditarProductoClient from "./EditarProductoClient";
import { getProductsByAffiliatedBusinessId } from "@/lib/api/products";

export const revalidate = 0;

export default async function EditarProductoPage({ params }: { params: { id: string; relId: string } }) {
  const { id: businessId, relId } = params;
  const productsRes = await getProductsByAffiliatedBusinessId(businessId);
  const allRelations = (productsRes.data ?? []) as any[];
  const relation = allRelations.find((r: any) => r.affiliated_business_x_prod === relId) || null;
  const businessName = relation?.affiliated_business_id?.affiliated_business_name || "";
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
