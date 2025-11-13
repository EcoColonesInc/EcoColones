import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained a specific affiliated business by ID with its transactions info
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const supabase = await createClient();

        // Allow the affiliated business id to come from the route param or from a query param
        const url = new URL(request.url);
        const affiliatedBusinessId = url.searchParams.get('affiliated_business') ?? (await params).id ?? null;

        if (!affiliatedBusinessId) {
            return NextResponse.json({ error: 'affiliated_business id is required' }, { status: 400 });
        }

        // Select transactions for the given affiliated_business_id
        const { data, error } = await supabase
            .from('affiliatedbusinesstransaction')
            .select('ab_transaction_id, person_id(user_name, first_name, last_name), affiliated_business_id(affiliated_business_name), currency(currency_name, currency_exchange), product_id(product_name), total_price, product_amount, transaction_code, state, created_at')
            .eq('affiliated_business_id', affiliatedBusinessId);
        if (error) {
            console.error('Get affiliated business error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get affiliated business unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
