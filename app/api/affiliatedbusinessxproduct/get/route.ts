import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all affiliated business with its products
export async function GET() {
    try {
        const supabase = await createClient();

        // Select all affiliated business with related product info
        const { data, error } = await supabase
            .from('affiliatedbusinessxproduct')
            .select('affiliated_business_x_prod, product_id(product_name, description, state), affiliated_business_id(affiliated_business_name, description), product_price')
            .order('affiliated_business_x_prod', { ascending: true });
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
