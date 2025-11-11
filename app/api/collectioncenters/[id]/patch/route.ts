import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { buildPatchHandler } from "@/lib/api/update";

// PATCH - Modificar un centro de recolección
export const PATCH = buildPatchHandler({
	table: "collectioncenter",
	idColumn: "collectioncenter_id",
	allowedFields: [
		"person_id",
		"district_id",
		"name",
		"phone",
		"manager_name",
		"latitude",
		"longitude",
	],
});
