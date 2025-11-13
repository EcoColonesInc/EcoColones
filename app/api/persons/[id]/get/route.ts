import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained a specific province by ID with its info
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const resolvedParams = await context.params;
        const personId = resolvedParams.id;

        // Select the person with related country info
        const { data, error } = await supabase
            .from('person')
            .select('user_id, first_name, last_name, second_last_name, telephone_number, birth_date, user_name, identification, role, gender, document_type')
            .eq('user_id', personId)
            .single();
        if (error) {
            console.error('Get person error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get person unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
