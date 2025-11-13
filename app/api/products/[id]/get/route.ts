import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained a specific product by ID with its info
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const supabase = await createClient();
        const productId = (await params).id;

        // Select the product with its info
        const { data, error } = await supabase
            .from('product')
            .select('product_id, product_name, description, state')
            .eq('product_id', productId)
            .single();

        if (error) {
            console.error('Get product error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get product unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
