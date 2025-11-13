import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all the data from collectioncenterxmaterial
export async function GET() {
    try {
        const supabase = await createClient();

        // Call the stored function `get_collectioncenterxmaterial` which returns joined collectioncenterxmaterial rows
        const { data, error } = await supabase.rpc('get_collectioncenterxmaterial');

        if (error) {
            console.error('Get collectioncenterxmaterial error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get collectioncenterxmaterial unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
