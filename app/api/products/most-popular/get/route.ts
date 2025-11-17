import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Returns top 5 most redeemed products (RPC)
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_most_popular_products");

    if (error) {
      console.error("Get most popular products error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: unknown) {
    console.error("Get most popular products unexpected error:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
