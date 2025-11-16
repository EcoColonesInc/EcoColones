import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all affiliated business transactions with its info
export async function GET() {
    try {
        const supabase = await createClient();

        // Select all affiliated business transactions with related info
        const { data, error } = await supabase
            .from('affiliatedbusinesstransaction')
            .select('ab_transaction_id, person_id(user_name, first_name, last_name), affiliated_business_id(affiliated_business_name), currency(currency_name, currency_exchange), product_id(product_name), total_price, product_amount, transaction_code, state, created_at')
            .order('created_at', { ascending: true });
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
