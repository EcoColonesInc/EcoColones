import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained a specific district by ID with its info
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const supabase = await createClient();
        const districtId = (await params).id;

        // Select the district with related city info
        const { data, error } = await supabase
            .from('district')
            .select('district_id, district_name, city_id(city_id, city_name)')
            .eq('district_id', districtId)
            .single();
        if (error) {
            console.error('Get district error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get district unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
