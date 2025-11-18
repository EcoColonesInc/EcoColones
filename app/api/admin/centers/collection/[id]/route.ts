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
    const centerId = parseInt(id);

    if (isNaN(centerId)) {
      return NextResponse.json(
        { error: "ID de centro de acopio inválido" },
        { status: 400 }
      );
    }

    const { data: existingCenter, error: checkError } = await supabase
      .from("collectioncenter")
      .select("collectioncenter_id")
      .eq("collectioncenter_id", centerId)
      .single();

    if (checkError || !existingCenter) {
      return NextResponse.json(
        { error: "Centro de acopio no encontrado" },
        { status: 404 }
      );
    }

    await supabase.from("collectioncentertransaction").delete().eq("collection_center_id", centerId);
    await supabase.from("collectioncenterxmaterial").delete().eq("collection_center_id", centerId);
    await supabase.from("userrecycling").delete().eq("collection_center_id", centerId);


    const { error: deleteError } = await supabase
      .from("collectioncenter")
      .delete()
      .eq("collectioncenter_id", centerId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: `Error al eliminar centro de acopio: ${deleteError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: "Centro de acopio eliminado exitosamente",
        centerId: centerId 
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
