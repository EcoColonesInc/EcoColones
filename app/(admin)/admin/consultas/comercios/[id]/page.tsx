/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAffiliatedBusinessById } from "@/lib/api/affiliatedbusiness";
import { getAllBusinessTypes } from "@/lib/api/businesstypes";
import ComercioDetalleClient from "./ComercioDetalleClient";

interface PageParams { id: string }

export default async function AdminComercioDetallePage({ params }: { params: PageParams }) {
  const id = params.id;
  const [businessRes, typesRes] = await Promise.all([
    getAffiliatedBusinessById(id),
    getAllBusinessTypes(),
  ]);
  return (
    <ComercioDetalleClient
      id={id}
      initialBusiness={businessRes.data as any}
      initialTypes={(typesRes.data ?? []) as any[]}
    />
  );
}
