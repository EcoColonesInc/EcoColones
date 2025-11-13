import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all affiliated business transactions by affiliated business ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const supabase = await createClient();

        // Accept affiliated_business id from route param (params.id) or query param 'affiliated_business'
        const url = new URL(request.url);
        const affiliatedBusinessId = url.searchParams.get('affiliated_business') ?? (await params).id ?? null;

        // Build query and apply filter when affiliatedBusinessId is provided
        let query = supabase
            .from('affiliatedbusinesstransaction')
            .select('ab_transaction_id, person_id(user_name, first_name, last_name), affiliated_business_id(affiliated_business_name), currency(currency_name, currency_exchange), product_id(product_name), total_price, product_amount, transaction_code, state, created_at')
            .order('created_at', { ascending: true });

        if (affiliatedBusinessId) {
            query = query.eq('affiliated_business_id', affiliatedBusinessId);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Get affiliated business transactions error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get affiliated business transactions unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
