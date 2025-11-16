import { buildPatchHandler } from "@/lib/api/update";
// PATCH - Modificar relación centro-material
export const PATCH = buildPatchHandler({
  table: "collectioncenterxmaterial",
  idColumn: "collection_center_x_product_id",
  allowedFields: ["material_id", "collection_center_id"],
});
