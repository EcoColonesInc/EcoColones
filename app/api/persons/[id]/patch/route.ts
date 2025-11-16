import { buildPatchHandler } from "@/lib/api/update";
// PATCH - Modificar una persona
export const PATCH = buildPatchHandler({
  table: "person",
  idColumn: "user_id",
  allowedFields: [
    "first_name",
    "last_name",
    "second_last_name",
    "telephone_number",
    "birth_date",
    "user_name",
    "identification",
    "role",
    "gender",
    "document_type",
  ],
});
