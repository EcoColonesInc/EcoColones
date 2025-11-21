import { TransactionManager } from "@/components/custom/affiliate/transactionManager";
import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';

export default async function transactions() {
    let errorMessage: string | null = null;
    let transactions: any[] = [];

    try {
        const supabase = await createClient();

        // Get the current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            errorMessage = 'No autorizado. Por favor, inicia sesión.';
        } else {
            console.log('Fetching transactions for user:', user.id);

            // Get the user's affiliated business
            const { data: businesses, error: businessError } = await supabase
                .from('affiliatedbusiness')
                .select('affiliated_business_id')
                .eq('manager_id', user.id)
                .limit(1)
                .single();

            if (businessError) {
                console.error('Business fetch error:', businessError);
                errorMessage = `Error al obtener el negocio: ${businessError.message}`;
            } else if (!businesses) {
                errorMessage = 'No se encontró un negocio afiliado para este usuario.';
            } else {
                console.log('Found business:', businesses.affiliated_business_id);

                // Fetch transactions using RPC
                const { data: rpcData, error: rpcError } = await supabase.rpc(
                    'get_transactions_by_affiliated_business_id',
                    { p_affiliated_business_id: businesses.affiliated_business_id }
                );

                if (rpcError) {
                    console.error('RPC error:', rpcError);
                    errorMessage = `Error al obtener transacciones: ${rpcError.message}`;
                } else {
                    console.log('Raw transactions data:', rpcData);
                    
                    // Transform data to match expected structure
                    transactions = (rpcData || []).map((tx: any, index: number) => ({
                        ab_transaction_id: tx.ab_transaction_id || `transaction-${index}`,
                        person_id: {
                            user_name: tx.user_name || '',
                            first_name: tx.first_name || '',
                            last_name: tx.last_name || ''
                        },
                        affiliated_business_id: {
                            affiliated_business_name: tx.affiliated_business_name || ''
                        },
                        product_id: {
                            product_name: tx.product_names || tx.product_name || ''
                        },
                        currency: {
                            currency_name: tx.currency_name || 'CRC',
                            currency_exchange: tx.currency_exchange || 1
                        },
                        total_price: tx.total_price || 0,
                        product_amount: tx.total_product_amount || tx.product_amount || 0,
                        transaction_code: tx.transaction_code || '',
                        state: tx.state || '',
                        created_at: tx.created_at || ''
                    }));
                    
                    console.log('Transformed transactions:', transactions.length);
                }
            }
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar transacciones';
    }

    return (
        <div className="container mx-auto px-4 mb-20">
            <div className="pt-8 mb-5">
                <h1 className="text-3xl font-bold text-gray-900">Transacciones</h1>
                <p className="text-gray-600 mt-1">
                    Gestiona y revisa todas las transacciones de tu negocio
                </p>
            </div>
            {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <p className="font-semibold">Error al cargar transacciones:</p>
                    <p className="text-sm">{errorMessage}</p>
                </div>
            )}
            {!errorMessage && transactions.length === 0 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                    <p className="font-semibold">No hay transacciones disponibles</p>
                    <p className="text-sm">Aún no se han registrado transacciones para tu negocio.</p>
                </div>
            )}
            <div>
                <TransactionManager
                    initialTransactions={transactions}
                    errMsg={errorMessage}
                />
            </div>
        </div>
    );
}
