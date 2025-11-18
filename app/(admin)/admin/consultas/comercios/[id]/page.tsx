import { getAffiliatedBusinessById } from "@/lib/api/affiliatedbusiness";
import { getAllBusinessTypes } from "@/lib/api/businesstypes";
import ComercioDetalleClient from "./ComercioDetalleClient";

interface PageParams {
  id: string;
}

interface BusinessType {
  business_type_id: string;
  name: string;
}

interface BusinessData {
  affiliated_business_id: string;
  affiliated_business_name: string;
  description: string | null;
  phone: string | null;
  email?: { email?: string } | null;
  manager_id?: {
    first_name?: string | null;
    last_name?: string | null;
    second_last_name?: string | null;
  } | null;
  business_type_id?: { name?: string | null } | null;
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
}

export default async function AdminComercioDetallePage({
  params,
}: {
  params: PageParams;
}) {
  const id = params.id;
  const [businessRes, typesRes] = await Promise.all([
    getAffiliatedBusinessById(id),
    getAllBusinessTypes(),
  ]);
  return (
    <ComercioDetalleClient
      id={id}
      initialBusiness={(businessRes.data ?? null) as BusinessData | null}
      initialTypes={(typesRes.data ?? []) as BusinessType[]}
    />
  );
}
