import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all users_with_most_recycled with its info
export async function GET() {
    try {
        const supabase = await createClient();

        // Select all users_with_most_recycled with related info
        const { data, error } = await supabase
            .from('userrecycling')
            .select('person_id(first_name, last_name, second_last_name), collection_center_id(name), amount_recycle, date')
            .order('date', { ascending: true });

        if (error) {
            console.error('Get user recycling error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get user recycling unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
