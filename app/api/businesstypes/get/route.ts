import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all business types with its info
export async function GET() {
    try {
        const supabase = await createClient();

        // Select all business types with its info
        const { data, error } = await supabase
            .from('businesstype')
            .select('business_type_id, name')
            .order('name', { ascending: true });

        if (error) {
            console.error('Get business types error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get business types unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
