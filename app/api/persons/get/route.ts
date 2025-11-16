import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all persons with its info
export async function GET() {
    try {
        const supabase = await createClient();

        // Select all persons with related info
        const { data, error } = await supabase
            .from('person')
            .select('user_id, first_name, last_name, second_last_name, telephone_number, birth_date, user_name, identification, role, gender, document_type')
            .order('first_name', { ascending: true });

        if (error) {
            console.error('Get persons error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get persons unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
