import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Role } from "@/types/role";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    // Await params para Next.js 15
    const { id } = await params;
    const businessId = parseInt(id);

    if (isNaN(businessId)) {
      return NextResponse.json(
        { error: "ID de negocio inválido" },
        { status: 400 }
      );
    }

    // Verificar que el negocio existe
    const { data: existingBusiness, error: checkError } = await supabase
      .from("affiliatedbusiness")
      .select("affiliated_business_id")
      .eq("affiliated_business_id", businessId)
      .single();

    if (checkError || !existingBusiness) {
      return NextResponse.json(
        { error: "Negocio afiliado no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar registros relacionados en orden
    // 1. Eliminar transacciones del negocio
    await supabase
      .from("affiliatedbusinesstransaction")
      .delete()
      .eq("affiliated_business_id", businessId);

    // 2. Eliminar productos asociados
    await supabase
      .from("affiliatedbusinessxproduct")
      .delete()
      .eq("affiliated_business_id", businessId);

    // 3. Eliminar el negocio
    const { error: deleteError } = await supabase
      .from("affiliatedbusiness")
      .delete()
      .eq("affiliated_business_id", businessId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: `Error al eliminar negocio afiliado: ${deleteError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: "Negocio afiliado eliminado exitosamente",
        businessId: businessId 
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
