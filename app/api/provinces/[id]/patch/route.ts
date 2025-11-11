import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { buildPatchHandler } from "@/lib/api/update";

// PATCH - Modificar una provincia
export const PATCH = buildPatchHandler({
	table: "province",
	idColumn: "province_id",
	allowedFields: ["country_id", "province_name"],
});
