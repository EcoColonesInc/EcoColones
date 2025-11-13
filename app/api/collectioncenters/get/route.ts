import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all provinces with its info
export async function GET() {
	try {
		const supabase = await createClient();

		// Select all collection centers with related country info
		const { data, error } = await supabase
			.from('collectioncenter')
			.select('collectioncenter_id, person_id(first_name, last_name), district_id(district_name), name, phone, latitude, longitude')
			.order('name', { ascending: true });

		if (error) {
			console.error('Get collection centers error:', error);
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ data }, { status: 200 });

	} catch (err: unknown) {
		console.error('Get collection centers unexpected error:', err);
		if (err instanceof Error) {
			return NextResponse.json({ error: err.message }, { status: 500 });
		}
		return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
