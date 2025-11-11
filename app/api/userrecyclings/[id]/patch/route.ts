import { buildPatchHandler } from "@/lib/api/update";
// PATCH - Modificar un registro de reciclaje de usuario
export const PATCH = buildPatchHandler({
  table: "userrecycling",
  idColumn: "user_recycling",
  allowedFields: ["person_id", "collection_center_id", "amount_recycle", "date"],
});
