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
    const provinceId = parseInt(id);

    if (isNaN(provinceId)) {
      return NextResponse.json(
        { error: "ID de provincia inválido" },
        { status: 400 }
      );
    }

    const { data: existingProvince, error: checkError } = await supabase
      .from("province")
      .select("province_id")
      .eq("province_id", provinceId)
      .single();

    if (checkError || !existingProvince) {
      return NextResponse.json(
        { error: "Provincia no encontrada" },
        { status: 404 }
      );
    }

    const { count } = await supabase.from("city").select("*", { count: "exact", head: true }).eq("province_id", provinceId);
    if (count && count > 0) {
      return NextResponse.json({ error: `No se puede eliminar. Hay ${count} ciudad(es) asociada(s) a esta provincia.` }, { status: 400 });
    }


    const { error: deleteError } = await supabase
      .from("province")
      .delete()
      .eq("province_id", provinceId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: `Error al eliminar provincia: ${deleteError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: "Provincia eliminada exitosamente",
        provinceId: provinceId 
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
