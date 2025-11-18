import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Role } from "@/types/role";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { data: roleData } = await supabase.rpc("get_user_role", {
      p_user_id: user.id,
    });

    if (roleData !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Permisos insuficientes" },
        { status: 403 }
      );
    }

    // Await params para Next.js 15
    const { id } = await params;
    const parameterId = parseInt(id);

    if (isNaN(parameterId)) {
      return NextResponse.json(
        { error: "ID de parámetro inválido" },
        { status: 400 }
      );
    }

    const { data: existingParameter, error: checkError } = await supabase
      .from("parameter")
      .select("parameter_id")
      .eq("parameter_id", parameterId)
      .single();

    if (checkError || !existingParameter) {
      return NextResponse.json(
        { error: "Parámetro no encontrado" },
        { status: 404 }
      );
    }



    const { error: deleteError } = await supabase
      .from("parameter")
      .delete()
      .eq("parameter_id", parameterId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: `Error al eliminar parámetro: ${deleteError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: "Parámetro eliminado exitosamente",
        parameterId: parameterId 
      },
      { status: 200 }
    );

  } catch (err: unknown) {
    console.error("Delete error:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
