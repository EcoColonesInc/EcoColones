import { getAllCollectionCenters } from "@/lib/api/collectioncenters";
import { getMostRecycledMaterials } from "@/lib/api/materials";
import CentersClient from "./CentersClient";

export const revalidate = 0;

export default async function AdminConsultasCentersPage() {
  const [centersRes, topMaterialsRes] = await Promise.all([
    getAllCollectionCenters(),
    getMostRecycledMaterials(),
  ]);

  return (
    <CentersClient
      initialCenters={(centersRes.data ?? []) as unknown[]}
      initialTopMaterials={(topMaterialsRes.data ?? []) as unknown[]}
    />
  );
}
