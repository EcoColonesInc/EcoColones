import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all units with its info
export async function GET() {
	try {
		const supabase = await createClient();

		// Select all units with related info
		const { data, error } = await supabase
			.from('unit')
			.select('unit_id, unit_name, unit_exchange')
			.order('unit_name', { ascending: true });

		if (error) {
			console.error('Get units error:', error);
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ data }, { status: 200 });

	} catch (err: unknown) {
		console.error('Get units unexpected error:', err);
		if (err instanceof Error) {
			return NextResponse.json({ error: err.message }, { status: 500 });
		}
		return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
