import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { buildPatchHandler } from "@/lib/api/update";

// PATCH - Modificar un negocio
export const PATCH = buildPatchHandler({
	table: "affiliatedbussiness", // Assuming business corresponds to affiliatedbussiness table
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
