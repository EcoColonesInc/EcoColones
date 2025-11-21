import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/affiliatedbusinesstransactions/check
 * Verifica una transacción por código sin modificarla
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { transaction_code } = await request.json();

    if (!transaction_code) {
      return NextResponse.json(
        { error: "El código de transacción es requerido" },
        { status: 400 }
      );
    }

    // 1. Verificar usuario autenticado y obtener su negocio
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    // Obtener el negocio del usuario actual
    const { data: business, error: businessError } = await supabase
      .from('affiliatedbusiness')
      .select('affiliated_business_id')
      .eq('manager_id', user.id)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: "No se encontró un negocio afiliado para este usuario" },
        { status: 404 }
      );
    }

    // 2. Buscar la transacción por código
    const { data: transactions, error: searchError } = await supabase.rpc(
      'get_transactions_by_affiliated_business_id',
      { p_affiliated_business_id: business.affiliated_business_id }
    );

    if (searchError) {
      console.error("Error searching transaction:", searchError);
      return NextResponse.json(
        { error: `Error al buscar la transacción: ${searchError.message}` },
        { status: 500 }
      );
    }

    // Buscar la transacción específica
    const transaction = transactions?.find((tx: any) => 
      tx.transaction_code === transaction_code
    );

    if (!transaction) {
      return NextResponse.json(
        { error: "No se encontró una transacción con ese código en este negocio" },
        { status: 404 }
      );
    }

    // 3. Verificar estado
    if (transaction.state?.toLowerCase() !== 'active') {
      return NextResponse.json(
        { error: `Esta transacción ya fue procesada (Estado: ${transaction.state})` },
        { status: 400 }
      );
    }

    // 4. Obtener el registro completo
    const { data: fullTransaction, error: fetchFullError } = await supabase
      .from('affiliatedbusinesstransaction')
      .select('ab_transaction_id, person_id, affiliated_business_id, total_price, transaction_code, state, currency_id')
      .eq('transaction_code', transaction_code)
      .eq('affiliated_business_id', business.affiliated_business_id)
      .single();

    if (fetchFullError || !fullTransaction) {
      console.error("Error fetching full transaction:", fetchFullError);
      return NextResponse.json(
        { error: `Error al obtener detalles de la transacción: ${fetchFullError?.message || 'No encontrada'}` },
        { status: 500 }
      );
    }

    // 5. Obtener los items de la transacción
    const { data: transactionItems, error: itemsError } = await supabase
      .from('affiliatedbusinesstransactionitem')
      .select('product_id, product_amount')
      .eq('ab_transaction_id', fullTransaction.ab_transaction_id);

    if (itemsError) {
      console.error("Error fetching transaction items:", itemsError);
    }

    // 6. Obtener nombres de productos
    const productDetails = [];
    if (transactionItems && transactionItems.length > 0) {
      for (const item of transactionItems) {
        const { data: productData } = await supabase
          .from('product')
          .select('product_name')
          .eq('product_id', item.product_id)
          .single();
        
        if (productData) {
          productDetails.push({
            name: productData.product_name,
            amount: item.product_amount
          });
        }
      }
    }

    // 7. Retornar información de la transacción (sin modificarla)
    return NextResponse.json({
      success: true,
      transaction: {
        ab_transaction_id: fullTransaction.ab_transaction_id,
        transaction_code: fullTransaction.transaction_code,
        person_name: `${transaction.first_name} ${transaction.last_name}`,
        user_name: transaction.user_name,
        products: productDetails,
        total_price: fullTransaction.total_price,
        currency_name: transaction.currency_name,
        state: fullTransaction.state
      }
    });

  } catch (error) {
    console.error("Unexpected error in check endpoint:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido al verificar la transacción" },
      { status: 500 }
    );
  }
}
