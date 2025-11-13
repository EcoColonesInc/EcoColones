import { buildPatchHandler } from "@/lib/api/update";

// PATCH - Modificar un negocio
export const PATCH = buildPatchHandler({
    table: "affiliatedbussiness",
    idColumn: "affiliated_business_id",
    allowedFields: [
        "district_id",
        "business_type_id",
        "affiliated_business_name",
        "phone",
        "manager_name",
        "email",
        "description",
    ],
});
