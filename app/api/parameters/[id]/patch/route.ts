import { buildPatchHandler } from "@/lib/api/update";
// PATCH - Modificar un parámetro
export const PATCH = buildPatchHandler({
  table: "parameter",
  idColumn: "parameter_id",
  allowedFields: ["name", "value"],
});
