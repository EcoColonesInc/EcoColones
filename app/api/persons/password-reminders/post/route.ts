import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userIds: string[] = Array.isArray(body?.userIds) ? body.userIds : [];
    const redirectTo: string | undefined = typeof body?.redirectTo === 'string' ? body.redirectTo : undefined;

    if (!userIds.length) {
      return NextResponse.json({ error: "userIds es requerido" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: "Faltan credenciales del servidor Supabase" }, { status: 500 });
    }

    const admin = createServiceClient(url, serviceKey);

    // Limitar a 500 correos para evitar abuso accidental
    const ids = userIds.slice(0, 500);

    let sent = 0; const failures: Array<{ id: string; error: string }>=[];
    for (const id of ids) {
      try {
        const { data, error } = await admin.auth.admin.getUserById(id);
        if (error) throw new Error(error.message);
        const email = data.user?.email;
        if (!email) { throw new Error("Usuario sin email"); }

        const finalRedirect = redirectTo || `${process.env.NEXT_PUBLIC_SITE_URL || ''}/user/profile`;

        // Enviar email de recuperación con el mismo mecanismo de Supabase que el signup
        const { error: resetErr } = await admin.auth.resetPasswordForEmail(email, { redirectTo: finalRedirect });
        if (resetErr) throw new Error(resetErr.message);
        sent++;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'unknown';
        failures.push({ id, error: msg });
      }
    }

    const status = sent === ids.length ? 200 : sent === 0 ? 500 : 207; // 207: multi-status/partial
    return NextResponse.json({ sent, failures }, { status });
  } catch (err: unknown) {
    console.error("password-reminders POST error:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
