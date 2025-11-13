import { buildPatchHandler } from "@/lib/api/update";
// PATCH - Modificar una transacción de negocio afiliado
export const PATCH = buildPatchHandler({
  table: "affiliatedbusinesstransaction",
  idColumn: "ab_transaction_id",
  allowedFields: [
    "person_id",
    "affiliated_business_id",
    "currency_id",
    "product_id",
    "total_price",
    "product_amount",
    "transaction_code",
    "state",
  ],
});
