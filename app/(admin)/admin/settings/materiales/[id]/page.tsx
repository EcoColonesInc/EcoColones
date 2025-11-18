import MaterialFormClient from "../material-form/MaterialFormClient";
import { getMaterialById } from "@/lib/api/materials";
import { getAllUnits } from "@/lib/api/units";

export const revalidate = 0;

// Adaptación a la API de params asincrónicos de Next.js 15
export default async function EditarMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [materialRes, unitsRes] = await Promise.all([
    getMaterialById(id),
    getAllUnits(),
  ]);
  return (
    <MaterialFormClient
      mode="edit"
      initialMaterial={materialRes.data as unknown}
      units={(unitsRes.data ?? []) as unknown[]}
    />
  );
}
