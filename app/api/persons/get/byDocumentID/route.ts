import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtener user_id por número de identificación (cédula)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const identification = searchParams.get('identification')?.trim();

    if (!identification) {
      return NextResponse.json({ error: "Missing identification parameter" }, { status: 400 });
    }

    const supabase = await createClient();

    // Query person by identification (varchar field)
    const { data, error } = await supabase
      .from('person')
      .select('user_id')
      .eq('identification', identification)
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data?.user_id) {
      return NextResponse.json({ error: `No person found with identification ${identification}` }, { status: 404 });
    }

    return NextResponse.json({ user_id: data.user_id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
