import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all collection centers transactions with its info
export async function GET() {
    try {
        const supabase = await createClient();

        // Select all collection centers transactions with related info
        const { data, error } = await supabase
            .from('collectioncentertransaction')
            .select('cc_transaction_id, person_id(user_name, first_name, last_name), collection_center_id(name), material_id(name), total_points, material_amount, created_at')
            .order('cc_transaction_id', { ascending: true });

        if (error) {
            console.error('Get all collection center transactions error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get all collection center transactions unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
