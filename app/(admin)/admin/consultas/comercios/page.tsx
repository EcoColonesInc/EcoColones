import { getAllAffiliatedBusiness } from "@/lib/api/affiliatedbusiness";
import { getAllBusinessTypes } from "@/lib/api/businesstypes";
import { getMostPopularProducts } from "@/lib/api/products";
import ComerciosClient from "./ComerciosClient";

export default async function AdminConsultasComerciosPage() {
  const [bRes, tRes, pRes] = await Promise.all([
    getAllAffiliatedBusiness(),
    getAllBusinessTypes(),
    getMostPopularProducts(),
  ]);
  return (
    <ComerciosClient
      initialBusinesses={(bRes.data ?? []) as unknown[]}
      initialTypes={(tRes.data ?? []) as unknown[]}
      initialTopProducts={(pRes.data ?? []) as unknown[]}
    />
  );
}
