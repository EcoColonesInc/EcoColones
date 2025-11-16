import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained a specific unit by ID with its info
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const resolvedParams = await context.params;
        const unitId = resolvedParams.id;

        // Select the unit with its info
        const { data, error } = await supabase
            .from('unit')
            .select('unit_id, unit_name, unit_exchange')
            .eq('unit_id', unitId)
            .single();
        if (error) {
            console.error('Get unit error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get unit unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
