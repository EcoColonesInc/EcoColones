import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained a specific collection center by ID with its transactions info
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();

        // Allow the collection center id to come from the route param or from a query param
        const url = new URL(request.url);
        const resolvedParams = await context.params;
        const collectionCenterId = url.searchParams.get('collection_center') ?? resolvedParams.id ?? null;

        if (!collectionCenterId) {
            return NextResponse.json({ error: 'collection_center id is required' }, { status: 400 });
        }

        // Select transactions for the given collection_center_id
        const { data, error } = await supabase
            .from('collectioncentertransaction')
            .select('cc_transaction_id, person_id(user_name, first_name, last_name), collection_center_id(name), material_id(name), total_points, material_amount, created_at')
            .eq('collection_center_id', collectionCenterId);
        if (error) {
            console.error('Get collection center error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get collection center unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
