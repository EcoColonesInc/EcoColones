import { buildPatchHandler } from "@/lib/api/update";

// PATCH - Modificar un material
export const PATCH = buildPatchHandler({
    table: "material",
    idColumn: "material_id",
    allowedFields: ["unit_id", "name", "equivalent_points"],
});
