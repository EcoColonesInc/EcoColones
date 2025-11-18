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
    const unitId = parseInt(id);

    if (isNaN(unitId)) {
      return NextResponse.json(
        { error: "ID de unidad inválido" },
        { status: 400 }
      );
    }

    const { data: existingUnit, error: checkError } = await supabase
      .from("unit")
      .select("unit_id")
      .eq("unit_id", unitId)
      .single();

    if (checkError || !existingUnit) {
      return NextResponse.json(
        { error: "Unidad no encontrada" },
        { status: 404 }
      );
    }

    const { count } = await supabase.from("material").select("*", { count: "exact", head: true }).eq("unit_id", unitId);
    if (count && count > 0) {
      return NextResponse.json({ error: `No se puede eliminar. Hay ${count} material(es) usando esta unidad.` }, { status: 400 });
    }


    const { error: deleteError } = await supabase
      .from("unit")
      .delete()
      .eq("unit_id", unitId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: `Error al eliminar unidad: ${deleteError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: "Unidad eliminada exitosamente",
        unitId: unitId 
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
