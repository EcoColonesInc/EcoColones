import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { buildPatchHandler } from "@/lib/api/update";

// PATCH - Modificar un distrito
export const PATCH = buildPatchHandler({
	table: "district",
	idColumn: "district_id",
	allowedFields: ["city_id", "district_name"],
});
