import MaterialFormClient from "../material-form/MaterialFormClient";
import { getAllUnits } from "@/lib/api/units";

export const revalidate = 0;

export default async function AgregarMaterialPage() {
  const unitsRes = await getAllUnits();
  return (
    <MaterialFormClient
      mode="create"
      units={(unitsRes.data ?? []) as unknown[]}
      initialMaterial={null}
    />
  );
}
