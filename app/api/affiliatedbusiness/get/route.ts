import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all affiliated business with its info
export async function GET() {
	try {
		const supabase = await createClient();

		// Select all affiliated business with related info
		const { data, error } = await supabase
			.from('affiliatedbusiness')
			.select('affiliated_business_id, affiliated_business_name, description, phone, email, manager_name, business_type_id(name), district_id(district_name)')
			.order('affiliated_business_name', { ascending: true });
		if (error) {
			console.error('Get business error:', error);
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ data }, { status: 200 });

	} catch (err: unknown) {
		console.error('Get business unexpected error:', err);
		if (err instanceof Error) {
			return NextResponse.json({ error: err.message }, { status: 500 });
		}
		return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
