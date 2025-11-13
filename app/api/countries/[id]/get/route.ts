import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained a specific country by ID with its info
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const supabase = await createClient();
        const countryId = (await params).id;

        // Select the country with its info
        const { data, error } = await supabase
            .from('country')
            .select('country_id, country_name')
            .eq('country_id', countryId)
            .single();
        if (error) {
            console.error('Get country error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get country unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
