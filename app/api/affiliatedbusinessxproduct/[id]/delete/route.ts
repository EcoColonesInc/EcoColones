import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// DELETE - Eliminar relación negocio-producto por ID
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = await createClient();
    const params = await Promise.resolve(context.params);
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "Falta parámetro id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("affiliatedbusinessxproduct")
      .delete()
      .eq("affiliated_business_x_prod", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Relación eliminada" }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
