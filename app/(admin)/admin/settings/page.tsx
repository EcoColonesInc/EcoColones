import MaterialesClient from "./MaterialesClient";
import { getAllMaterials } from "@/lib/api/materials";
import { getAllPersons } from "@/lib/api/persons";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const [materialsRes, personsRes] = await Promise.all([
    getAllMaterials(),
    getAllPersons(),
  ]);
  return (
    <MaterialesClient
      initialMaterials={(materialsRes.data ?? []) as unknown[]}
      persons={(personsRes.data ?? []) as unknown[]}
    />
  );
}
