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
    const cityId = parseInt(id);

    if (isNaN(cityId)) {
      return NextResponse.json(
        { error: "ID de ciudad inválido" },
        { status: 400 }
      );
    }

    const { data: existingCity, error: checkError } = await supabase
      .from("city")
      .select("city_id")
      .eq("city_id", cityId)
      .single();

    if (checkError || !existingCity) {
      return NextResponse.json(
        { error: "Ciudad no encontrada" },
        { status: 404 }
      );
    }

    const { count } = await supabase.from("district").select("*", { count: "exact", head: true }).eq("city_id", cityId);
    if (count && count > 0) {
      return NextResponse.json({ error: `No se puede eliminar. Hay ${count} distrito(s) asociado(s) a esta ciudad.` }, { status: 400 });
    }


    const { error: deleteError } = await supabase
      .from("city")
      .delete()
      .eq("city_id", cityId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: `Error al eliminar ciudad: ${deleteError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: "Ciudad eliminada exitosamente",
        cityId: cityId 
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
