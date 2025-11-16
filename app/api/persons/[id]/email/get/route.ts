import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// GET - Obtiene el email del usuario desde auth.users usando la service role key
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: "person_id is required" }, { status: 400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      // Sin service key no podemos consultar auth.users
      return NextResponse.json({ data: { email: null } }, { status: 200 });
    }

    const admin = createServiceClient(url, serviceKey);
    const { data, error } = await admin.auth.admin.getUserById(id);
    if (error) {
      console.error("Get auth user by id error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const email = data.user?.email ?? null;
    return NextResponse.json({ data: { email } }, { status: 200 });
  } catch (err: unknown) {
    console.error("Get email unexpected error:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
