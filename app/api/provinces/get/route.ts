import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all provinces with its info
export async function GET() {
	try {
		const supabase = await createClient();

		// Select all provinces with related country info
		const { data, error } = await supabase
			.from('province')
			.select('province_id, province_name, country(country_id, country_name)')
			.order('province_name', { ascending: true });

		if (error) {
			console.error('Get provinces error:', error);
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ data }, { status: 200 });

	} catch (err: unknown) {
		console.error('Get provinces unexpected error:', err);
		if (err instanceof Error) {
			return NextResponse.json({ error: err.message }, { status: 500 });
		}
		return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
