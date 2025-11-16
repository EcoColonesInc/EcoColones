import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained a specific collection center by ID with its info
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const resolvedParams = await context.params;
        const collectionCenterId = resolvedParams.id;

        // Select the collection center with related info
        const { data, error } = await supabase
            .from('collectioncenter')
            .select('collectioncenter_id, person_id(first_name, last_name), district_id(district_name, city_id(city_name, province_id(province_name, country_id(country_name)))), name, phone, latitude, longitude')
            .eq('collectioncenter_id', collectionCenterId)
            .single();
        if (error) {
            console.error('Get collection center error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get collection center unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
