import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtains the points for a specific person (by person_id)
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const resolvedParams = await context.params;
        const personId = resolvedParams.id;

        if (!personId) {
            return NextResponse.json({ error: 'person_id is required' }, { status: 400 });
        }

        // Select the point row for the given person_id
        const { data, error } = await supabase
            .from('point')
            .select('person_id(user_name), point_amount')
            .eq('person_id', personId)
            .maybeSingle();
        if (error) {
            console.error('Get point by user error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get point by user unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
