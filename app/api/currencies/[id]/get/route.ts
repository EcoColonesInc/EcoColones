import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained a specific currency by ID with its info
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const supabase = await createClient();
        const currencyId = (await params).id;

        // Select the currency with related country info
        const { data, error } = await supabase
            .from('currency')
            .select('currency_id, currency_name, currency_exchange')
            .eq('currency_id', currencyId)
            .single();
        if (error) {
            console.error('Get currency error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get currency unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
