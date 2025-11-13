import { buildPatchHandler } from "@/lib/api/update";

// PATCH - Modificar un país
export const PATCH = buildPatchHandler({
    table: "country",
    idColumn: "country_id",
    allowedFields: ["country_name"],
});
