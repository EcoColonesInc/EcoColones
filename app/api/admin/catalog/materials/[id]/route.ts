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

    const materialId = parseInt(params.id);

    if (isNaN(materialId)) {
      return NextResponse.json(
        { error: "ID de material inválido" },
        { status: 400 }
      );
    }

    // Verificar que el material existe
    const { data: existingMaterial, error: checkError } = await supabase
      .from("material")
      .select("material_id")
      .eq("material_id", materialId)
      .single();

    if (checkError || !existingMaterial) {
      return NextResponse.json(
        { error: "Material no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar registros relacionados en orden
    // 1. Eliminar transacciones que usan este material
    await supabase
      .from("collectioncentertransaction")
      .delete()
      .eq("material_id", materialId);

    // 2. Eliminar relaciones material-centro
    await supabase
      .from("collectioncenterxmaterial")
      .delete()
      .eq("material_id", materialId);

    // 3. Eliminar el material
    const { error: deleteError } = await supabase
      .from("material")
      .delete()
      .eq("material_id", materialId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: `Error al eliminar material: ${deleteError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: "Material eliminado exitosamente",
        materialId: materialId 
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
