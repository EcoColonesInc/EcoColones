import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST - Desactivar (marcar inactivo) un comercio afiliado
// Requiere que la tabla tenga una columna 'state'. Si no existe, devolverá error.
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const { data, error } = await supabase
      .from("affiliatedbusiness")
      .update({ state: "inactive" })
      .eq("affiliated_business_id", id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data?.length) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({ message: "Comercio desactivado", data }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
