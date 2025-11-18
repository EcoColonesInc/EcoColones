import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Role } from "@/types/role";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar rol de administrador
    const { data: roleData } = await supabase.rpc("get_user_role", {
      p_user_id: user.id,
    });

    if (roleData !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Permisos insuficientes" },
        { status: 403 }
      );
    }

    const countryId = parseInt(params.id);

    if (isNaN(countryId)) {
      return NextResponse.json(
        { error: "ID de país inválido" },
        { status: 400 }
      );
    }

    // Verificar que el país existe
    const { data: existingCountry, error: checkError } = await supabase
      .from("country")
      .select("country_id")
      .eq("country_id", countryId)
      .single();

    if (checkError || !existingCountry) {
      return NextResponse.json(
        { error: "País no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si hay provincias usando este país
    const { count } = await supabase
      .from("province")
      .select("*", { count: "exact", head: true })
      .eq("country_id", countryId);

    if (count && count > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. Hay ${count} provincia(s) asociada(s) a este país.` },
        { status: 400 }
      );
    }

    // Eliminar el país
    const { error: deleteError } = await supabase
      .from("country")
      .delete()
      .eq("country_id", countryId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: `Error al eliminar país: ${deleteError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: "País eliminado exitosamente",
        countryId: countryId 
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
