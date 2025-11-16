import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all points by user with their info
export async function GET() {
    try {
        const supabase = await createClient();

        // Select all points by user with related info
        const { data, error } = await supabase
            .from('point')
            .select('person_id, point_amount')
            .order('point_amount', { ascending: true });

        if (error) {
            console.error('Get points error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get points unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
