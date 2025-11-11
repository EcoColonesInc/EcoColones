import { buildPatchHandler } from "@/lib/api/update";
// PATCH - Modificar un producto
export const PATCH = buildPatchHandler({
  table: "product",
  idColumn: "product_id",
  allowedFields: ["product_name", "description", "state"],
});
