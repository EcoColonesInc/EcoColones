import { buildPatchHandler } from "@/lib/api/update";
// PATCH - Modificar puntos de una persona
export const PATCH = buildPatchHandler({
  table: "point",
  idColumn: "person_id",
  allowedFields: ["point_amount"],
});
