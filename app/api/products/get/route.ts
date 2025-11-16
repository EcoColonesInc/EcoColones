import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all products with its info
export async function GET() {
    try {
        const supabase = await createClient();

        // Select all products with related info
        const { data, error } = await supabase
            .from('product')
            .select('product_id, product_name, description, state')
            .order('product_name', { ascending: true });

        if (error) {
            console.error('Get products error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get products unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
