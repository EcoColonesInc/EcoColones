import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all products by affiliated business ID
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();

        // Accept affiliated_business id from route param (params.id) or query param 'affiliated_business'
        const url = new URL(request.url);
        const resolvedParams = await context.params;
        const affiliatedBusinessId = url.searchParams.get('affiliated_business') ?? resolvedParams.id ?? null;

        // Build query and apply filter when affiliatedBusinessId is provided
        let query = supabase
            .from('affiliatedbusinessxproduct')
            .select('affiliated_business_x_prod, product_id(product_id, product_name, description, state), affiliated_business_id(affiliated_business_name, description), product_price')
            .order('affiliated_business_x_prod', { ascending: true });

        if (affiliatedBusinessId) {
            query = query.eq('affiliated_business_id', affiliatedBusinessId);
        }

        const { data, error } = await query;

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
