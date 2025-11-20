import { getCollectionCenterById } from "@/lib/api/collectioncenters";
import { getMaterialsByCollectionCenterId, getAllMaterials } from "@/lib/api/materials";
import CenterDetalleClient from "./CenterDetalleClient";

interface PageParams { id: string; }

type CenterData = {
  collectioncenter_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  person_id?: { first_name?: string | null; last_name?: string | null } | null;
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
  latitude?: number | null;
  longitude?: number | null;
} | null;

type MaterialData = { material_id?: string; name?: string; material_name?: string };

export default async function AdminCenterDetallePage({ params }: { params: Promise<PageParams> | PageParams }) {
  const resolved = await Promise.resolve(params);
  const id = resolved.id;
  const [centerRes, centerMaterialsRes, allMaterialsRes] = await Promise.all([
    getCollectionCenterById(id),
    getMaterialsByCollectionCenterId(id),
    getAllMaterials(),
  ]);
  const initialCenter: CenterData = (centerRes.data ?? null) as CenterData;
  const initialCenterMaterials: MaterialData[] = (centerMaterialsRes.data ?? []) as MaterialData[];
  const initialAllMaterials: MaterialData[] = (allMaterialsRes.data ?? []) as MaterialData[];
  return (
    <CenterDetalleClient
      id={id}
      initialCenter={initialCenter}
      initialCenterMaterials={initialCenterMaterials}
      initialAllMaterials={initialAllMaterials}
    />
  );
}
