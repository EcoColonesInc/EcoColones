import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained a specific materials by ID with its info
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const resolvedParams = await context.params;
        const materialsId = resolvedParams.id;

        // Select the materials with related info
        const { data, error } = await supabase
            .from('material')
            .select('material_id, name, equivalent_points, unit_id(unit_id, unit_name)')
            .eq('material_id', materialsId)
            .single();
        if (error) {
            console.error('Get materials error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get materials unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
