import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all currencies with its info
export async function GET() {
	try {
		const supabase = await createClient();

		// Select all currencies with related country info
		const { data, error } = await supabase
			.from('currency')
			.select('currency_id, currency_name, currency_exchange')
			.order('currency_name', { ascending: true });

		if (error) {
			console.error('Get currencies error:', error);
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ data }, { status: 200 });

	} catch (err: unknown) {
		console.error('Get currencies unexpected error:', err);
		if (err instanceof Error) {
			return NextResponse.json({ error: err.message }, { status: 500 });
		}
		return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
