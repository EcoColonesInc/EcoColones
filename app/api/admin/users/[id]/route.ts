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
    const { id: userId } = await params;

    // Validar que no se elimine a sí mismo
    if (userId === user.id) {
      return NextResponse.json(
        { error: "No puedes eliminarte a ti mismo" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const { data: existingUser, error: checkError } = await supabase
      .from("person")
      .select("user_id")
      .eq("user_id", userId)
      .single();

    if (checkError || !existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar registros relacionados en orden
    // 1. Eliminar puntos del usuario
    await supabase.from("point").delete().eq("person_id", userId);

    // 2. Eliminar transacciones de negocios afiliados
    await supabase.from("affiliatedbusinesstransaction").delete().eq("person_id", userId);

    // 3. Eliminar transacciones de centros de acopio
    await supabase.from("collectioncentertransaction").delete().eq("person_id", userId);

    // 4. Eliminar registros de reciclaje
    await supabase.from("userrecycling").delete().eq("person_id", userId);

    // 5. Eliminar centros de acopio del usuario (si es manager)
    await supabase.from("collectioncenter").delete().eq("person_id", userId);

    // 6. Eliminar usuario de la tabla person
    const { error: deleteError } = await supabase
      .from("person")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: `Error al eliminar usuario: ${deleteError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: "Usuario eliminado exitosamente",
        userId: userId 
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
