import { buildPatchHandler } from "@/lib/api/update";

// PATCH - Modificar un comercio afiliado
// Ajustado para usar la tabla correcta 'affiliatedbusiness' y manager_id
export const PATCH = buildPatchHandler({
    table: "affiliatedbusiness",
    idColumn: "affiliated_business_id",
    allowedFields: [
        "district_id",
        "business_type_id",
        "affiliated_business_name",
        "phone",
        "manager_id", // referencia a person
        "email", // id de email (FK)
        "description",
    ],
});
