import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained a specific city by ID with related province info
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const resolvedParams = await context.params;
        const cityId = resolvedParams.id;
        // Select the city with related province info
        const { data, error } = await supabase
            .from('city')
            .select('city_id, city_name, province_id(province_id, province_name)')
            .eq('city_id', cityId)
            .single();
        if (error) {
            console.error('Get city error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get city unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
