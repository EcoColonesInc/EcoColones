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

    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID de producto inválido" },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const { data: existingProduct, error: checkError } = await supabase
      .from("product")
      .select("product_id")
      .eq("product_id", productId)
      .single();

    if (checkError || !existingProduct) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar registros relacionados en orden
    // 1. Eliminar transacciones que usan este producto
    await supabase
      .from("affiliatedbusinesstransaction")
      .delete()
      .eq("product_id", productId);

    // 2. Eliminar relaciones producto-negocio
    await supabase
      .from("affiliatedbusinessxproduct")
      .delete()
      .eq("product_id", productId);

    // 3. Eliminar el producto
    const { error: deleteError } = await supabase
      .from("product")
      .delete()
      .eq("product_id", productId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: `Error al eliminar producto: ${deleteError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: "Producto eliminado exitosamente",
        productId: productId 
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
