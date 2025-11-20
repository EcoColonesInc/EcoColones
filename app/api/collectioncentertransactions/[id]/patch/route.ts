import { buildPatchHandler } from "@/lib/api/update";
// PATCH - Modificar una transacción de centro de recolección
export const PATCH = buildPatchHandler({
  table: "collectioncentertransaction",
  idColumn: "cc_transaction_id",
  allowedFields: [
    "person_id",
    "collection_center_id",
    "material_id",
    "total_points",
    "material_amount",
  ],
});
