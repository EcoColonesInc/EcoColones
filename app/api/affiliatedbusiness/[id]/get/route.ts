import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained a specific affiliated business by ID with its info
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const supabase = await createClient();
        const businessId = (await params).id;

        // Select the affiliated business with related info
        const { data, error } = await supabase
            .from('affiliatedbusiness')
            .select('affiliated_business_id, affiliated_business_name, description, phone, email, manager_name, business_type_id(name), district_id(district_name)')
            .eq('affiliated_business_id', businessId)
            .single();
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
