import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all parameters with its info
export async function GET() {
    try {
        const supabase = await createClient();

        // Select all parameters with related info
        const { data, error } = await supabase
            .from('parameter')
            .select('parameter_id, name, value')
            .order('parameter_id', { ascending: true });

        if (error) {
            console.error('Get parameters error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get parameters unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
