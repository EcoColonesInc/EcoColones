import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// DELETE - Eliminar un comercio afiliado por ID
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const { error } = await supabase
      .from("affiliatedbusiness")
      .delete()
      .eq("affiliated_business_id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Comercio eliminado" }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
