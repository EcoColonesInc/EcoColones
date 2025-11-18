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

    const transactionId = parseInt(params.id);

    if (isNaN(transactionId)) {
      return NextResponse.json(
        { error: "ID de transacción inválido" },
        { status: 400 }
      );
    }

    // Verificar que la transacción existe
    const { data: existingTransaction, error: checkError } = await supabase
      .from("collectioncentertransaction")
      .select("cc_transaction_id")
      .eq("cc_transaction_id", transactionId)
      .single();

    if (checkError || !existingTransaction) {
      return NextResponse.json(
        { error: "Transacción no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar la transacción
    const { error: deleteError } = await supabase
      .from("collectioncentertransaction")
      .delete()
      .eq("cc_transaction_id", transactionId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: `Error al eliminar transacción: ${deleteError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: "Transacción eliminada exitosamente",
        transactionId: transactionId 
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
