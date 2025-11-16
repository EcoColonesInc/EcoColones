import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained a specific province by ID with its info
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const resolvedParams = await context.params;
        const personId = resolvedParams.id;

        if (!personId) {
            return NextResponse.json({ error: 'person_id is required' }, { status: 400 });
        }

        // Use stored function to fetch profile info (RPC)
        const { data, error } = await supabase.rpc('get_profile_info', { p_user_id: personId });

        if (error) {
            console.error('Get profile info (rpc) error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get person unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
