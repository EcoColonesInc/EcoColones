import { buildPatchHandler } from "@/lib/api/update";

// PATCH - Modificar una unidad
export const PATCH = buildPatchHandler({
    table: "unit",
    idColumn: "unit_id",
    allowedFields: ["unit_name", "unit_exchange"],
});
