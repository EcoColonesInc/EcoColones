import { buildPatchHandler } from "@/lib/api/update";
// PATCH - Modificar una bitácora (binnacle)
export const PATCH = buildPatchHandler({
  table: "binnacle",
  idColumn: "binnacle_id",
  // No tiene updated_by en el esquema, así que lo desactivamos
  hasUpdatedBy: false,
  allowedFields: ["object_name", "change_type", "old_value", "new_value"],
});
