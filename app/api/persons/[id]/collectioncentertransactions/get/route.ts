import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all collection centers transactions by a person ID
// Example: http://localhost:3000/api/persons/d7ad1807-12e8-4e3f-ab7c-17d98f9f5ca5/collectioncentertransactions/get?date=2025-11-11

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();

        // Accept person_id either from the route param (params.id) or from a query param
        const url = new URL(request.url);
        const resolvedParams = await context.params;
        const personId = url.searchParams.get('person_id') ?? resolvedParams.id ?? null;

        // Require personId because the RPC expects an user UUID
        if (!personId) {
            return NextResponse.json({ error: 'person_id is required' }, { status: 400 });
        }

        // Optional date filter in YYYY-MM-DD format
        const dateParam = url.searchParams.get('date') ?? null;
        const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : null;

        // Call stored function to get user's collection center transactions
        const { data, error } = await supabase.rpc('get_user_collectioncenter_transactions', { p_user_id: personId, p_date: date });

        if (error) {
            console.error('Get collection center transactions by user (rpc) error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get all collection center transactions by user unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
