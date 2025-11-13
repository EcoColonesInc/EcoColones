import { buildPatchHandler } from "@/lib/api/update";
// PATCH - Modificar relación negocio-producto afiliado
export const PATCH = buildPatchHandler({
  table: "affiliatedbusinessxproduct",
  idColumn: "affiliated_business_x_prod",
  allowedFields: [
    "product_id",
    "affiliated_business_id",
    "product_price",
  ],
});
