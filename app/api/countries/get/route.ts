import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all countries with its info
export async function GET() {
	try {
		const supabase = await createClient();

		// Select all countries with its info
		const { data, error } = await supabase
			.from('country')
			.select('country_id, country_name')
			.order('country_name', { ascending: true });

		if (error) {
			console.error('Get countries error:', error);
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ data }, { status: 200 });

	} catch (err: unknown) {
		console.error('Get countries unexpected error:', err);
		if (err instanceof Error) {
			return NextResponse.json({ error: err.message }, { status: 500 });
		}
		return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
