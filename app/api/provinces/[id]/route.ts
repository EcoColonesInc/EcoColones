import { buildPatchHandler } from "@/lib/api/update";

// PATCH - Modificar una provincia existente
export const PATCH = buildPatchHandler({
    table: "province",
    idColumn: "province_id",
    allowedFields: ["country_id", "province_name"],
});

