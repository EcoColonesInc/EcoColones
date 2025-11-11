import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { buildPatchHandler } from "@/lib/api/update";

// PATCH - Modificar una moneda
export const PATCH = buildPatchHandler({
	table: "currency",
	idColumn: "currency_id",
	allowedFields: ["currency_name", "currency_exchange"],
});
