import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all the data from collectioncenterxmaterial by collection center id
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();

        // Accept collection_center id from route param or query param
        const url = new URL(request.url);
        const resolvedParams = await context.params;
        const collectionCenterId = url.searchParams.get('collection_center_id') ?? resolvedParams.id ?? null;

        if (!collectionCenterId) {
            return NextResponse.json({ error: 'collection_center_id is required' }, { status: 400 });
        }

        // Call the stored function with the parameter
        const { data, error } = await supabase.rpc('get_collectioncenterxmaterial', { p_collection_center_id: collectionCenterId });

        if (error) {
            console.error('Get collectioncenterxmaterial by collection center id error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get collectioncenterxmaterial by collection center id unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
