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

    const businessTypeId = parseInt(params.id);

    if (isNaN(businessTypeId)) {
      return NextResponse.json(
        { error: "ID de tipo de negocio inválido" },
        { status: 400 }
      );
    }

    // Verificar que el tipo de negocio existe
    const { data: existingType, error: checkError } = await supabase
      .from("businesstype")
      .select("business_type_id")
      .eq("business_type_id", businessTypeId)
      .single();

    if (checkError || !existingType) {
      return NextResponse.json(
        { error: "Tipo de negocio no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si hay negocios usando este tipo
    const { count } = await supabase
      .from("affiliatedbusiness")
      .select("*", { count: "exact", head: true })
      .eq("business_type_id", businessTypeId);

    if (count && count > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. Hay ${count} negocio(s) usando este tipo.` },
        { status: 400 }
      );
    }

    // Eliminar el tipo de negocio
    const { error: deleteError } = await supabase
      .from("businesstype")
      .delete()
      .eq("business_type_id", businessTypeId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: `Error al eliminar tipo de negocio: ${deleteError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: "Tipo de negocio eliminado exitosamente",
        businessTypeId: businessTypeId 
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
