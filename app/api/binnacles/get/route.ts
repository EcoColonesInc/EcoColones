import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all the data from binnacle
export async function GET() {
    try {
        const supabase = await createClient();

        // Call the stored function `get_binnacle` which returns the joined binnacle rows
        const { data, error } = await supabase.rpc('get_binnacle');

        if (error) {
            console.error('Get binnacle error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get binnacle unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
