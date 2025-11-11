import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { buildPatchHandler } from "@/lib/api/update";

// PATCH - Modificar una ciudad
export const PATCH = buildPatchHandler({
	table: "city",
	idColumn: "city_id",
	allowedFields: ["province_id", "city_name"],
});
