import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all provinces with related province info
export async function GET() {
	try {
		const supabase = await createClient();

		// Select all cities with related province info
		const { data, error } = await supabase
			.from('city')
			.select('city_id, city_name, province_id(province_id, province_name)')
			.order('city_name', { ascending: true });

		if (error) {
			console.error('Get cities error:', error);
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ data }, { status: 200 });

	} catch (err: unknown) {
		console.error('Get cities unexpected error:', err);
		if (err instanceof Error) {
			return NextResponse.json({ error: err.message }, { status: 500 });
		}
		return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
