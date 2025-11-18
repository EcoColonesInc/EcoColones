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
    const districtId = parseInt(id);

    if (isNaN(districtId)) {
      return NextResponse.json(
        { error: "ID de distrito inválido" },
        { status: 400 }
      );
    }

    const { data: existingDistrict, error: checkError } = await supabase
      .from("district")
      .select("district_id")
      .eq("district_id", districtId)
      .single();

    if (checkError || !existingDistrict) {
      return NextResponse.json(
        { error: "Distrito no encontrado" },
        { status: 404 }
      );
    }

    const { count: businessCount } = await supabase.from("affiliatedbusiness").select("*", { count: "exact", head: true }).eq("district_id", districtId);
    const { count: centerCount } = await supabase.from("collectioncenter").select("*", { count: "exact", head: true }).eq("district_id", districtId);
    const totalCount = (businessCount || 0) + (centerCount || 0);
    if (totalCount > 0) {
      return NextResponse.json({ error: `No se puede eliminar. Hay ${totalCount} establecimiento(s) asociado(s) a este distrito.` }, { status: 400 });
    }


    const { error: deleteError } = await supabase
      .from("district")
      .delete()
      .eq("district_id", districtId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: `Error al eliminar distrito: ${deleteError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: "Distrito eliminado exitosamente",
        districtId: districtId 
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
