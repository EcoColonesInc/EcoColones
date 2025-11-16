import { buildPatchHandler } from "@/lib/api/update";
// PATCH - Modificar un tipo de negocio
export const PATCH = buildPatchHandler({
  table: "businesstype",
  idColumn: "business_type_id",
  allowedFields: ["name"],
});
